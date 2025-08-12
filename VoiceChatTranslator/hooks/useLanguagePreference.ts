import {useCallback, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import Toast from "react-native-toast-message";

const STORAGE_KEY = 'userLanguagePreference';

const SYSTEM_LOCALE =
  Localization.getLocales?.()[0]?.languageTag?.trim() || 'en-US';

export const LANGUAGE_OPTIONS = [
  {code: 'auto', label: `Auto-detect (System: ${SYSTEM_LOCALE})`},
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

const LABEL_MAP = new Map(LANGUAGE_OPTIONS.map(o => [o.code, o.label]));
const isValidCode = (code?: string | null) =>
  !!code && (code === 'auto' || LABEL_MAP.has(code));


export const useLanguagePreference = () => {
  const [language, setLanguageState] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(true);

  const effectiveLanguage = language === 'auto' ? SYSTEM_LOCALE : language;

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        setLanguageState(isValidCode(stored) ? stored! : 'auto');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Language load error:',
          text2: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (code: string) => {
    const next = isValidCode(code) ? code : 'auto';
    setLanguageState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Language save error:',
        text2: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const getLanguageLabel = useCallback(
    () => LABEL_MAP.get(language) ?? language,
    [language],
  );

  const languageOptions = useMemo(() => LANGUAGE_OPTIONS, []);

  return {
    language: effectiveLanguage,
    setLanguage,
    getLanguageLabel,
    isLoading,
    languageOptions,
  };
};
