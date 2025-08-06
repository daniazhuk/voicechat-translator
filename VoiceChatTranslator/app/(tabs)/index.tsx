import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AudioMessage } from '@/components/AudioMessage';
import { useVoiceChat } from '@/hooks/useVoiceChat';

export default function HomeScreen() {
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

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (scrollViewRef) {
      scrollViewRef.scrollToEnd({ animated: true });
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.card}>
          <ThemedText style={styles.title}>Voice Chat Translator</ThemedText>

          {/* Session Key Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>Session Key</ThemedText>
            <TextInput
              style={styles.input}
              value={sessionKey}
              onChangeText={setSessionKey}
              placeholder="Enter session key"
              placeholderTextColor="#999"
              editable={sessionStatus.status === 'idle'}
            />
          </ThemedView>

          {/* Connection Status */}
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.statusText}>
              Status: {sessionStatus.status}
            </ThemedText>
            <ThemedText style={styles.statusMessage}>
              {sessionStatus.message}
            </ThemedText>
          </ThemedView>

          {/* Connect/Disconnect Button */}
          {sessionStatus.status === 'idle' ? (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={connect}
              disabled={!sessionKey}
            >
              <ThemedText style={styles.buttonText}>Connect</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.connectButton, styles.disconnectButton]}
              onPress={disconnect}
            >
              <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
            </TouchableOpacity>
          )}

          {/* Voice Chat Controls */}
          {sessionStatus.status === 'connected' && (
            <ThemedView style={styles.voiceChatContainer}>
              <ThemedText style={styles.voiceChatTitle}>Voice Chat</ThemedText>

              {/* Messages List */}
              {messages.length > 0 && (
                <ScrollView
                  style={styles.messagesContainer}
                  ref={(ref) => setScrollViewRef(ref)}
                  onContentSizeChange={scrollToBottom}
                >
                  {messages.map((message) => (
                    <AudioMessage
                      key={message.id}
                      id={message.id}
                      timestamp={message.timestamp}
                      isLocal={message.isLocal}
                      isPlaying={message.isPlaying}
                      onPlay={playMessage}
                    />
                  ))}
                </ScrollView>
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

              {/* Playing Indicator */}
              {isPlaying && (
                <ThemedView style={styles.playingIndicator}>
                  <Ionicons name="volume-high" size={24} color="#4CAF50" />
                  <ThemedText style={styles.playingText}>
                    Playing audio...
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voiceChatContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  voiceChatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  messagesContainer: {
    maxHeight: 300,
    marginBottom: 16,
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
    marginTop: 16,
    gap: 8,
  },
  playingText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
