import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './vi';
import en from './en';

const savedLang = localStorage.getItem('lang') || 'vi';

i18n.use(initReactI18next).init({
  resources: { vi, en },
  lng: savedLang,
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
});

// Persist language change
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
});

export default i18n;
