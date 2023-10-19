import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// locale files are in /public/locales/{lang}/common.json
import en from '../public/locales/en/common.json';
import es from '../public/locales/es/common.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
};

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
});

export default i18n;