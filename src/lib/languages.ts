export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string; // BCP-47 for Web Speech API
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", speechCode: "en-US", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", speechCode: "es-ES", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", speechCode: "fr-FR", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", speechCode: "de-DE", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", speechCode: "it-IT", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", speechCode: "pt-BR", flag: "🇧🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", speechCode: "ru-RU", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", nativeName: "中文", speechCode: "zh-CN", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", speechCode: "ja-JP", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", speechCode: "ko-KR", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", speechCode: "ar-SA", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", speechCode: "hi-IN", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", speechCode: "tr-TR", flag: "🇹🇷" },
  { code: "pl", name: "Polish", nativeName: "Polski", speechCode: "pl-PL", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", speechCode: "nl-NL", flag: "🇳🇱" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", speechCode: "uk-UA", flag: "🇺🇦" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", speechCode: "sv-SE", flag: "🇸🇪" },
  { code: "th", name: "Thai", nativeName: "ไทย", speechCode: "th-TH", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", speechCode: "vi-VN", flag: "🇻🇳" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", speechCode: "el-GR", flag: "🇬🇷" },
];

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
