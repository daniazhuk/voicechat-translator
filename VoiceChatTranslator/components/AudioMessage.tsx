import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from './ThemedText';
import {ThemedView} from './ThemedView';
import {AudioMessage as AudioMessageType} from "@/hooks/useVoiceChat";

// Define props for the AudioMessage component
type AudioMessageProps = {
  message: AudioMessageType;
  onPlay: (id: string) => void;
};

export const AudioMessage: React.FC<AudioMessageProps> = ({
                                                            message,
                                                            onPlay,
                                                          }) => {
  // Format the timestamp for display
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        message.isLocal ? styles.localMessage : styles.remoteMessage,
      ]}
    >
      <View style={styles.messageContent}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => onPlay(message.id)}
          disabled={message.isPlaying}
        >
          <Ionicons
            name={message.isPlaying ? 'pause-circle' : 'play-circle'}
            size={36}
            color={message.isPlaying ? '#4CAF50' : '#2196F3'}
          />
        </TouchableOpacity>

        <View style={styles.messageInfo}>
          <ThemedText style={styles.messageType}>
            {message.isLocal ? 'You' : 'Other person'}
          </ThemedText>
          <ThemedText style={styles.timestamp}>
            {formatTime(message.timestamp)}
          </ThemedText>
        </View>

        {message.isPlaying && (
          <View style={styles.playingIndicator}>
            <Ionicons name="volume-high" size={20} color="#4CAF50"/>
          </View>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  localMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#687076',
  },
  remoteMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#687076',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    marginRight: 8,
  },
  messageInfo: {
    flex: 1,
  },
  messageType: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  playingIndicator: {
    marginLeft: 8,
  },
});
