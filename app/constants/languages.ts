/**
 * Supported languages for Google Speech-to-Text API
 * Synced with backend language list
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (United States)', nativeName: 'English' },
  { code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'English' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français' },
  { code: 'de-DE', name: 'German (Germany)', nativeName: 'Deutsch' },
  { code: 'it-IT', name: 'Italian (Italy)', nativeName: 'Italiano' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português' },
  { code: 'ja-JP', name: 'Japanese (Japan)', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文' },
  { code: 'ko-KR', name: 'Korean (South Korea)', nativeName: '한국어' },
  { code: 'ru-RU', name: 'Russian (Russia)', nativeName: 'Русский' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية' },
  { code: 'hi-IN', name: 'Hindi (India)', nativeName: 'हिन्दी' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)', nativeName: 'Nederlands' },
  { code: 'pl-PL', name: 'Polish (Poland)', nativeName: 'Polski' },
  { code: 'tr-TR', name: 'Turkish (Turkey)', nativeName: 'Türkçe' },
  { code: 'sv-SE', name: 'Swedish (Sweden)', nativeName: 'Svenska' },
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguageName(code: string): string {
  const language = getLanguageByCode(code);
  return language ? language.name : code;
}

export default SUPPORTED_LANGUAGES;
