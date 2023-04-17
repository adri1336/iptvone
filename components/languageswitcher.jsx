import { useRouter } from "next/router";
import styles from '@/styles/languageswitcher.module.css';
import { useTranslation } from 'next-i18next';
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const LanguageSwitcher = () => {
    const switchLanguage = () => {
        const currentLanguageIndex = languages.indexOf(router.locale);
        const nextLanguageIndex = currentLanguageIndex + 1 >= languages.length ? 0 : currentLanguageIndex + 1;
        const nextLanguage = languages[nextLanguageIndex];
        router.push(router.asPath, router.asPath, { locale: nextLanguage });
        if(typeof window !== 'undefined')
        localStorage.setItem('LANGUAGE', nextLanguage);
    };

    const { ref, focused } = useFocusable({
        onEnterPress: () => switchLanguage()
    });

    const { t } = useTranslation('common');
    const router = useRouter();
    const languages = router.locales;
    const currentLanguage = router.locale.toUpperCase();

    if(languages.length <= 1) return (<></>);
    return (<div ref={ ref } className={ styles.container + " d-flex align-items-center justify-content-center" + " " + (focused ? styles.containerFocused : "") } onClick={ () => switchLanguage() }>
        <span className="text-small fw-bold">{ t('COMMON.LANGUAGE') + ': ' + currentLanguage }</span>
    </div>);
};

export default LanguageSwitcher;