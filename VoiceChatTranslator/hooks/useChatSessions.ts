import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the chat session type
export type ChatSession = {
  id: string;
  name: string;
  lastUsed: string;
};

/**
 * Custom hook for managing chat sessions
 * Stores session keys as chat names and provides functions to manage them
 */
export const useChatSessions = () => {
  // State to store the list of chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load chat sessions from AsyncStorage on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const storedSessions = await AsyncStorage.getItem('chatSessions');
        if (storedSessions) {
          setChatSessions(JSON.parse(storedSessions));
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    };

    loadSessions();
  }, []);

  // Save chat sessions to AsyncStorage whenever they change
  useEffect(() => {
    const saveSessions = async () => {
      try {
        await AsyncStorage.setItem('chatSessions', JSON.stringify(chatSessions));
      } catch (error) {
        console.error('Error saving chat sessions:', error);
      }
    };

    if (chatSessions.length > 0) {
      saveSessions();
    }
  }, [chatSessions]);

  /**
   * Add a new chat session or update an existing one
   * @param sessionKey The session key to add or update
   * @param name Optional custom name for the session (defaults to session key)
   */
  const addChatSession = (sessionKey: string, name?: string) => {
    const now = new Date().toISOString();

    setChatSessions(prevSessions => {
      // Check if session already exists
      const existingSessionIndex = prevSessions.findIndex(s => s.id === sessionKey);

      if (existingSessionIndex >= 0) {
        // Update existing session
        const updatedSessions = [...prevSessions];
        updatedSessions[existingSessionIndex] = {
          ...updatedSessions[existingSessionIndex],
          lastUsed: now,
        };
        return updatedSessions;
      } else {
        // Add new session
        return [
          ...prevSessions,
          {
            id: sessionKey,
            name: name || sessionKey,
            lastUsed: now,
          }
        ];
      }
    });
  };

  /**
   * Remove a chat session
   * @param sessionKey The session key to remove
   */
  const removeChatSession = (sessionKey: string) => {
    setChatSessions(prevSessions =>
      prevSessions.filter(session => session.id !== sessionKey)
    );
  };

  /**
   * Rename a chat session
   * @param sessionKey The session key to rename
   * @param newName The new name for the session
   */
  const renameChatSession = (sessionKey: string, newName: string) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionKey
        ? {...session, name: newName}
        : session
      )
    );
  };

  return {
    chatSessions,
    addChatSession,
    removeChatSession,
    renameChatSession,
  };
};
