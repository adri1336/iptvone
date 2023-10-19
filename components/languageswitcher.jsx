import styles from '@/styles/languageswitcher.module.css';
import { useTranslation } from 'react-i18next';
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();
    const languages = Object.keys(i18n.services.resourceStore.data);
    const currentLanguage = i18n.language;

    const switchLanguage = () => {
        const currentLanguageIndex = languages.indexOf(currentLanguage);
        const nextLanguage = languages[currentLanguageIndex + 1] || languages[0];
        i18n.changeLanguage(nextLanguage);

        if(typeof window !== 'undefined')
        localStorage.setItem('LANGUAGE', nextLanguage);
    };

    const { ref, focused } = useFocusable({
        onEnterPress: () => switchLanguage()
    });

    if(languages.length <= 1) return (<></>);
    return (<div ref={ ref } className={ styles.container + " d-flex align-items-center justify-content-center" + " " + (focused ? styles.containerFocused : "") } onClick={ () => switchLanguage() }>
        <span className={ styles.languageText + " text-small fw-bold" }>{ t('COMMON.LANGUAGE') + ':'}</span>
        <span className="text-small fw-bold">{ currentLanguage }</span>
    </div>);
};

export default LanguageSwitcher;