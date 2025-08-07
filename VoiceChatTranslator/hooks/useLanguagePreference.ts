import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Define common BCP-47 language codes
const DEFAULT_LANGUAGE = (Localization.getLocales()[0].languageTag ?? 'en-US')+'auto';
export const LANGUAGE_OPTIONS = [
  {code: DEFAULT_LANGUAGE, label: 'Auto-detect'},
  {code: 'en-US', label: 'English (US)'},
  {code: 'en-GB', label: 'English (UK)'},
  {code: 'es-ES', label: 'Spanish (Spain)'},
  {code: 'fr-FR', label: 'French'},
  {code: 'de-DE', label: 'German'},
  {code: 'it-IT', label: 'Italian'},
  {code: 'pt-BR', label: 'Portuguese (Brazil)'},
  {code: 'ru-RU', label: 'Russian'},
  {code: 'zh-CN', label: 'Chinese (Simplified)'},
  {code: 'ja-JP', label: 'Japanese'},
  {code: 'ko-KR', label: 'Korean'},
  {code: 'ar-SA', label: 'Arabic'},
  {code: 'hi-IN', label: 'Hindi'},
  {code: 'uk-UA', label: 'Ukrainian'},
];

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'userLanguagePreference';

/**
 * Custom hook for managing user language preference
 * Stores the selected language in BCP-47 format in AsyncStorage
 */
export const useLanguagePreference = () => {
  // State to store the selected language
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadLanguage = async () => {
    try {
      setIsLoading(true);
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        setLanguageState(storedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load language preference from AsyncStorage on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  // Save language preference to AsyncStorage whenever it changes
  useEffect(() => {
    const saveLanguage = async () => {
      try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    };

    // Only save if not loading (prevents saving default before loading)
    if (!isLoading) {
      saveLanguage();
    }
  }, [language, isLoading]);

  /**
   * Set the language preference
   * @param languageCode BCP-47 language code
   */
  const setLanguage = (languageCode: string) => {
    setLanguageState(languageCode);
  };

  /**
   * Get the language label for the current code
   */
  const getLanguageLabel = () => {
    const option = LANGUAGE_OPTIONS.find(opt => opt.code === language);
    return option ? option.label : language;
  };

  return {
    language,
    loadLanguage,
    setLanguage,
    getLanguageLabel,
    isLoading,
    languageOptions: LANGUAGE_OPTIONS,
  };
};
