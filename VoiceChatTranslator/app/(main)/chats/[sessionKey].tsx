import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AudioMessage } from '@/components/AudioMessage';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useChatSessions } from '@/hooks/useChatSessions';
import {SafeAreaView} from "react-native-safe-area-context";

export default function ChatScreen() {
  const router = useRouter();
  const { sessionKey: routeSessionKey } = useLocalSearchParams<{ sessionKey: string }>();
  const { chatSessions, addChatSession } = useChatSessions();

  const {
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
  } = useVoiceChat();

  // Reference to scroll to bottom when new messages arrive
  const [scrollViewRef, setScrollViewRef] = useState<ScrollView | null>(null);

  // Get the current chat name
  const currentChat = chatSessions.find(chat => chat.id === sessionKey);
  const chatName = currentChat?.name || sessionKey;

  // Set the session key from the route params when the component mounts or changes
  useEffect(() => {
    if (routeSessionKey && routeSessionKey !== sessionKey) {
      // Disconnect from the current session before setting a new one
      if (sessionStatus.status !== 'idle' && sessionKey) {
        disconnect();
      }
      // Set the new session key after disconnecting
      setSessionKey(routeSessionKey);
    }
  }, [routeSessionKey, sessionKey, sessionStatus.status, disconnect]);

  // Connect to the session when the session key is set
  useEffect(() => {
    if (sessionKey && sessionStatus.status === 'idle') {
      connect();
    }
  }, [sessionKey]);

  // Update the chat session when connected
  useEffect(() => {
    if (sessionStatus.status === 'connected' && sessionKey) {
      addChatSession(sessionKey);
    }
  }, [sessionStatus.status]);

  // Handle going back to the chat list
  const handleBackToChats = () => {
    if (sessionStatus.status !== 'idle') {
      disconnect();
    }
    router.push('/(main)/chats/');
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (scrollViewRef) {
      scrollViewRef.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToChats}
        >
          <Ionicons name="arrow-back" size={24} color="#3B89E3" />
        </TouchableOpacity>

        <ThemedView style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>
            {chatName}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {sessionStatus.status === 'connected' ? 'Connected' : sessionStatus.status}
          </ThemedText>
        </ThemedView>

        {sessionStatus.status !== 'idle' && (
          <TouchableOpacity
            style={styles.disconnectIcon}
            onPress={disconnect}
          >
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Chat Content */}
      <ThemedView style={styles.chatContent}>
        {/* Connection Status */}
        {sessionStatus.status !== 'connected' && (
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.statusText}>
              Status: {sessionStatus.status}
            </ThemedText>
            <ThemedText style={styles.statusMessage}>
              {sessionStatus.message}
            </ThemedText>

            {/* Connect Button (only show if not connected and not already trying to connect) */}
            {sessionStatus.status === 'idle' && (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={connect}
                disabled={!sessionKey}
              >
                <ThemedText style={styles.buttonText}>Connect</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        )}

        {/* Messages List */}
        {sessionStatus.status === 'connected' && (
          <ScrollView
            style={styles.messagesContainer}
            ref={(ref) => setScrollViewRef(ref)}
            onContentSizeChange={scrollToBottom}
          >
            {messages.length === 0 ? (
              <ThemedView style={styles.emptyChat}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#999" />
                <ThemedText style={styles.emptyChatText}>
                  No messages yet. Start the conversation!
                </ThemedText>
              </ThemedView>
            ) : (
              messages.map((message) => (
                <AudioMessage
                  key={message.id}
                  message={message}
                  onPlay={playMessage}
                />
              ))
            )}
          </ScrollView>
        )}
      </ThemedView>

      {/* Voice Chat Controls (only show if connected) */}
      {sessionStatus.status === 'connected' && (
        <ThemedView style={styles.controlsContainer}>
          {/* Playing Indicator */}
          {isPlaying && (
            <ThemedView style={styles.playingIndicator}>
              <Ionicons name="volume-high" size={24} color="#3B89E3" />
              <ThemedText style={styles.playingText}>
                Playing audio...
              </ThemedText>
            </ThemedView>
          )}

          {/* Push-to-Talk Button */}
          <Pressable
            style={[
              styles.pushToTalkButton,
              isRecording && styles.recordingButton
            ]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isPlaying}
          >
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={32}
              color="white"
            />
            <ThemedText style={styles.pushToTalkText}>
              {isRecording ? "Recording..." : "Push to Talk"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  disconnectIcon: {
    padding: 8,
  },
  chatContent: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: '#3B89E3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    opacity: 0.5,
  },
  emptyChatText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  controlsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pushToTalkButton: {
    backgroundColor: '#2196F3',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  pushToTalkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  playingText: {
    fontSize: 14,
    color: '#3B89E3',
  },
});
