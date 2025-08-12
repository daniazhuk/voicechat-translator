import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/useColorScheme';
import {LanguageProvider} from "@/components/LanguageProvider";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>
        <Stack screenOptions={{ }}>
          <Stack.Screen name="(main)/chats" options={{headerShown: false}}/>
          <Stack.Screen name="+not-found"/>
        </Stack>
        <Toast />
      </LanguageProvider>
    </ThemeProvider>
  );
}
