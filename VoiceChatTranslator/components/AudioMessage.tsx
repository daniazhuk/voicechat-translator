import React, {useState} from 'react';
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
  const [showText, setShowText] = useState(false);

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

  const toggleTextVisibility = () => {
    setShowText(!showText);
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

        {(message.text || message.translatedText) && (
          <TouchableOpacity
            style={styles.textToggleButton}
            onPress={toggleTextVisibility}
          >
            <Ionicons
              name={showText ? "chevron-up-circle" : "chevron-down-circle"}
              size={20}
              color="#2196F3"
            />
          </TouchableOpacity>
        )}
      </View>

      {showText && (message.text || message.translatedText) && (
        <View style={styles.textContainer}>
          {message.text && (
            <View style={styles.textSection}>
              <ThemedText style={styles.textLabel}>Original:</ThemedText>
              <ThemedText style={styles.messageText}>{message.text}</ThemedText>
            </View>
          )}

          {message.translatedText && (
            <View style={styles.textSection}>
              <ThemedText style={styles.textLabel}>Translation:</ThemedText>
              <ThemedText style={styles.messageText}>{message.translatedText}</ThemedText>
            </View>
          )}
        </View>
      )}
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
  textToggleButton: {
    marginLeft: 8,
    padding: 4,
  },
  textContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  textSection: {
    marginBottom: 8,
  },
  textLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
    color: '#aaa',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
