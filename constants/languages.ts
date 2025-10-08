export interface Language {
  code: string; // BCP 47 code
  name: string;
  symbol: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', symbol: 'A' },
  { code: 'hi-IN', name: 'Hindi', symbol: 'अ' },
  { code: 'mr-IN', name: 'Marathi', symbol: 'म' },
  { code: 'gu-IN', name: 'Gujarati', symbol: 'ગ' },
  { code: 'ta-IN', name: 'Tamil', symbol: 'த' },
  { code: 'te-IN', name: 'Telugu', symbol: 'తె' },
  { code: 'bn-IN', name: 'Bengali', symbol: 'ব' },
  { code: 'kn-IN', name: 'Kannada', symbol: 'ಕ' },
  { code: 'ml-IN', name: 'Malayalam', symbol: 'മ' },
];

export const languageCodeToNameMap: { [key: string]: string } = {
  'en': 'English',
  'hi': 'Hindi',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'ta': 'Tamil',
  'te': 'Telugu',
  'bn': 'Bengali',
  'kn': 'Kannada',
  'ml': 'Malayalam'
};
