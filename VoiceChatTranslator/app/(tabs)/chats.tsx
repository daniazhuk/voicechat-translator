import {useState} from 'react';
import {Alert, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';

import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {ChatSession, useChatSessions} from '@/hooks/useChatSessions';
import {SafeAreaView} from "react-native-safe-area-context";
import {ThemedInput} from "@/components/ThemedInput";

export default function ChatsScreen() {
  const router = useRouter();
  const {chatSessions, addChatSession, removeChatSession} = useChatSessions();
  const [newSessionKey, setNewSessionKey] = useState('');

  // Handle creating a new chat session
  const handleAddChat = () => {
    if (!newSessionKey.trim()) {
      Alert.alert('Error', 'Please enter a session key');
      return;
    }

    addChatSession(newSessionKey.trim());
    setNewSessionKey('');
  };

  // Handle removing a chat session
  const handleRemoveChat = (sessionId: string) => {
    Alert.alert(
      'Remove Chat',
      'Are you sure you want to remove this chat?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeChatSession(sessionId)
        }
      ]
    );
  };

  // Handle selecting a chat session
  const handleSelectChat = (session: ChatSession) => {
    // Update the last used timestamp
    addChatSession(session.id);

    // Navigate to the chat screen with the session ID
    router.push({
      pathname: '/(tabs)/chat',
      params: {sessionKey: session.id}
    });
  };

  // Render a chat session item
  const renderChatItem = ({item}: { item: ChatSession }) => {
    // Format the last used date
    const lastUsedDate = new Date(item.lastUsed);
    const formattedDate = lastUsedDate.toLocaleDateString();
    const formattedTime = lastUsedDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleSelectChat(item)}
      >
        <ThemedView style={styles.chatIconContainer}>
          <Ionicons name="chatbubble" size={24} color="#4CAF50"/>
        </ThemedView>

        <ThemedView style={styles.chatInfo}>
          <ThemedText style={styles.chatName}>{item.name}</ThemedText>
          <ThemedText style={styles.chatDate}>
            Last used: {formattedDate} at {formattedTime}
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveChat(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336"/>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.card}>
          <ThemedText style={styles.title}>Voice Chat Messenger</ThemedText>

          {/* New Chat Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedInput
              style={styles.input}
              value={newSessionKey}
              onChangeText={setNewSessionKey}
              placeholder="Enter new session key"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddChat}
              disabled={!newSessionKey.trim()}
            >
              <ThemedText style={styles.buttonText}>Add Chat</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Chat List */}
          <ThemedView style={styles.listContainer}>
            <ThemedText style={styles.sectionTitle}>Your Chats</ThemedText>

            {chatSessions.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color="#999"/>
                <ThemedText style={styles.emptyText}>
                  No chats yet. Add a new chat to get started.
                </ThemedText>
              </ThemedView>
            ) : (
               <FlatList
                 data={chatSessions.sort((a, b) =>
                   new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
                 )}
                 renderItem={renderChatItem}
                 keyExtractor={item => item.id}
                 contentContainerStyle={styles.listContent}
               />
             )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer:{
    flex:1
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  reactLogo: {
    height: 100,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
