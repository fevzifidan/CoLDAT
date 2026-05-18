export const AVAILABLE_LANGUAGES = [
  { 
    code: 'tr', 
    label: 'TR', 
    countryCode: 'tr',
    alt: 'Türkçe'
  },
  { 
    code: 'en', 
    label: 'EN', 
    countryCode: 'gb',
    alt: 'English'
  }
];

export const getFlagUrl = (countryCode) => {
  return `https://flagcdn.com/w20/${countryCode}.png`;
};

export const getFlagSrcSet = (countryCode) => {
  return `https://flagcdn.com/w40/${countryCode}.png`;
};