import { CountryOption } from './types';

export const COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'americas' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'europe' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'turkey' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'asia' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'europe' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'europe' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'europe' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', region: 'europe' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'europe' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'europe' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', region: 'europe' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'europe' },
];

export function getCountry(code: string) {
  return COUNTRIES.find(c => c.code === code);
}
