import {useEffect, useRef, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {Audio} from "expo-av";
import * as FileSystem from 'expo-file-system';
import {useLanguage} from "@/components/LanguageProvider";
import Toast from "react-native-toast-message";

// Define types for session status
type SessionStatus = {
  status: 'idle' | 'connecting' | 'waiting' | 'connected' | 'error' | 'expired';
  message: string;
};

// Define type for audio messages
export type AudioMessage = {
  id: string;
  audioBase64: string;
  text?: string;
  translatedText?: string;
  fromLanguage?: string;
  toLanguage?: string;
  timestamp: string;
  isLocal: boolean;
  isPlaying: boolean;
};

/**
 * Custom hook for voice chat functionality
 * Uses expo-audio for recording and playback
 * Implements a chat-like interface for audio messages
 */
export const useVoiceChat = () => {
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? '10.0.2.2:3000';
  // Socket connection
  const socketRef = useRef<Socket | null>(null);

  // Get the user's language preference
  const {language} = useLanguage();

  // Session state
  const [sessionKey, setSessionKey] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    status: 'idle',
    message: 'Enter a session key to start',
  });

  // Audio state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Chat messages state - stores all audio messages for the chat interface
  const [messages, setMessages] = useState<AudioMessage[]>([]);

  /**
   * Connect to the server and join a session
   */
  const connect = () => {
    if (!sessionKey) {
      setSessionStatus({
        status: 'error',
        message: 'Please enter a session key',
      });
      return;
    }

    setSessionStatus({
      status: 'connecting',
      message: 'Connecting to another device...',
    });

    // Create socket connection
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      const targetLanguage = language.includes('auto') ? language.toLowerCase().substring(0, 5) : language.toLowerCase();
      socket.emit('joinSession', {sessionKey, language: targetLanguage});
    });

    // Handle session status updates
    socket.on('sessionStatus', (status: SessionStatus) => {
      setSessionStatus(status);
    });

    // Handle receiving data
    socket.on('voiceReceived', async (data) => {

      // If the data is audio, add it to messages
      if (data.audioBase64) {
        const newMessage: AudioMessage = {
          id: `remote-${Date.now()}`,
          ...data,
          timestamp: data.timestamp || new Date().toISOString(),
          isLocal: false,
          isPlaying: false,
        };

        // Add the new message to the chat history
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      Toast.show({
        type: 'error',
        text1: 'Socket error:',
        text2: error
      });
      setSessionStatus({
        status: 'error',
        message: error.message || 'An error occurred',
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      setSessionStatus({
        status: 'idle',
        message: 'Disconnected from server',
      });
    });
  };

  /**
   * Disconnect from the server and clean up
   */
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setSessionStatus({
      status: 'idle',
      message: 'Enter a session key to start',
    });

    // Clear messages when disconnecting
    setMessages([]);
  };

  /**
   * Start recording audio
   * Prevents creating multiple Recording objects by checking if one already exists
   */
  const startRecording = async () => {
    try {
      // If already recording, don't start a new recording
      // This prevents the "Only one Recording object can be prepared at a given time" error
      if (recording) {
        return;
      }

      // Request permissions
      const {granted} = await Audio.requestPermissionsAsync();

      if (!granted) {
        Toast.show({
          type: 'error',
          text1: 'Audio recording permissions not granted'
        });
        return;
      }

      // Prepare the recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const {recording: newRecording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HighQuality);

      setRecording(newRecording);
      setIsRecording(true);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error starting recording:',
        text2: error instanceof Error ? error.message : String(error),
      });
      // Ensure recording state is reset on error
      setRecording(null);
      setIsRecording(false);
    }
  };

  /**
   * Stop recording, convert to base64, and send the audio
   * Also adds the recording to the local message history
   */
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);

      // Stop the recording
      await recording.stopAndUnloadAsync();

      // Get the recording URI
      const uri = recording.getURI();
      if (!uri) {
        Toast.show({
          type: 'error',
          text1: 'Recording URI is null'
        });
        return;
      }

      // Read the file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {encoding: FileSystem.EncodingType.Base64});

      // Create a new message for the local chat history
      const newMessage: AudioMessage = {
        id: `local-${Date.now()}`,
        audioBase64: base64Audio,
        timestamp: new Date().toISOString(),
        isLocal: true,
        isPlaying: false,
      };

      // Add to messages
      setMessages(prevMessages => [...prevMessages, newMessage]);

      // Send the audio data to the server
      if (socketRef.current && sessionStatus.status === 'connected') {
        socketRef.current.emit('voiceTransfer', {
          audioBase64: base64Audio,
          timestamp: new Date().toISOString(),
        });
      }

      // Reset recording
      setRecording(null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error stopping recording:',
        text2: error instanceof Error ? error.message : String(error),
      });
      // Ensure recording state is reset on error
      setRecording(null);
      setIsRecording(false);
    }
  };

  /**
   * Play a specific message from the chat history
   * @param messageId The ID of the message to play
   */
  const playMessage = async (messageId: string) => {
    try {
      // Stop any currently playing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Find the message
      const message = messages.find(m => m.id === messageId);
      if (!message) {
        Toast.show({
          type: 'error',
          text1: 'Message not found'
        });
        return;
      }

      // Update message state to playing
      // This sets isPlaying to true for the selected message and false for all others
      setMessages(prevMessages =>
        prevMessages.map(m =>
          m.id === messageId
          ? {...m, isPlaying: true}
          : {...m, isPlaying: false}
        )
      );

      setIsPlaying(true);

      // Create a new sound object from the audio data
      const {sound} = await Audio.Sound.createAsync(
        {uri: `data:audio/mp3;base64,${message.audioBase64}`}
      );

      soundRef.current = sound;

      // Play the sound
      await sound.playAsync();

      // When playback finishes or encounters an error
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          // Handle playback error
          setIsPlaying(false);
          setMessages(prevMessages =>
            prevMessages.map(m =>
              m.id === messageId ? {...m, isPlaying: false} : m
            )
          );
          Toast.show({
            type: 'error',
            text1: 'Audio playback error:',
            text2: status.error
          });
          return;
        }

        if (status.didJustFinish) {
          // Handle playback completion
          setIsPlaying(false);
          setMessages(prevMessages =>
            prevMessages.map(m =>
              m.id === messageId ? {...m, isPlaying: false} : m
            )
          );
        }
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error playing audio:',
        text2: error instanceof Error ? error.message : String(error),
      });
      // Reset playing state on error
      setIsPlaying(false);
      setMessages(prevMessages =>
        prevMessages.map(m =>
          m.id === messageId ? {...m, isPlaying: false} : m
        )
      );
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Unload any playing sound
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }

      // Stop any ongoing recording
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  return {
    sessionKey,
    setSessionKey,
    sessionStatus,
    connect,
    disconnect,
    isRecording,
    isPlaying,
    startRecording,
    stopRecording,
    messages,
    playMessage,
  };
};
