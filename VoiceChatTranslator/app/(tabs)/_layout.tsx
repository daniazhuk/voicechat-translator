import {Stack} from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="chats"
      />
      <Stack.Screen
        name="chat"
      />
    </Stack>
  );
}
