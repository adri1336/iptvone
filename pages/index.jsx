import Keyboard from "@/components/keyboard";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ENV from "@/utils/env";
import { useRef } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import { useTranslation } from 'next-i18next';
import { loader } from "@/components/loader/loader";
import { toast } from 'react-toastify';
import parser from "iptv-playlist-parser";
import IPTV from "@/utils/iptv";
import Router from "next/router";
import { useRouter } from 'next/router';
import LanguageSwitcher from "@/components/languageswitcher";
import { Oval } from "react-loader-spinner";

export default () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { focusKey, setFocus, focusSelf } = useFocusable({});

	const [ pageLoaded, setPageLoaded ] = useState(false);
	const [ keyboardFocused, setKeyboardFocused ] = useState(false);
	const [ activeRef, setActiveRef ] = useState(null);
	const [ inputUrlValue, setInputUrlValue ] = useState('');
	const inputUrlRef = useRef(null);

	useEffect(() => {
		if(typeof window !== 'undefined') {
			loader(true, { message: t('PAGES.M3U.LOAD_MESSAGE'), opacity: 1.0, logo: true });

			const lang = localStorage.getItem('LANGUAGE');
			if(lang) router.push(router.asPath, router.asPath, { locale: lang });
		}
	}, []);

	useEffect(() => {
		if(router.isReady && typeof window !== 'undefined') {
			const { change } = router.query;

			const url = localStorage.getItem('M3U_URL');
			setInputUrlValue(url);
			if(!change && url) loadPlaylist(url);
			else {
				loader(false);
				setPageLoaded(true);
			}
		}
    }, [router.isReady]);

	const loadPlaylist = async url => {
		try {
			const res = await fetch(url, { method: 'GET' });
			if(res.ok) {
				try {
					//convertir la lista de canales a json
					const m3u = await res.text();
					const list = parser.parse(m3u);
					
					//extraer todos los grupos de la lista de canales
					let groups = [];
					list.items.forEach(item => {
						if(item?.group?.title && !groups.includes(item.group.title))
						groups.push(item.group.title);
					});

					//establecer los grupos y los canales
					IPTV.setURL(url);
					IPTV.setGroups(groups);
					IPTV.setItems(list.items);

					//redireccionar a la página de canales
					loader(false);
					Router.replace( "/library");
				}
				catch(e) {
					loader(false);
					setPageLoaded(true);
					toast.error(t('PAGES.M3U.LOAD_ERROR'));
				}
			}
			else {
				loader(false);
				setPageLoaded(true);
				toast.error(t('PAGES.M3U.LOAD_ERROR'));
			}
		}
		catch(e) {
			loader(false);
			setPageLoaded(true);
			toast.error(t('PAGES.M3U.LOAD_ERROR'));
		}
	};

    useEffect(() => {
        setFocus('keyboard');
    }, [focusSelf]);

	useEffect(() => {
		if(pageLoaded && inputUrlRef?.current)
		setActiveRef(inputUrlRef);
	}, [inputUrlRef, pageLoaded]);

	const handleSubmit = (e) => {
		e.preventDefault();
		loader(true);
		setPageLoaded(false);
		const url = inputUrlRef.current.value;
		if(url) {
			localStorage.setItem('M3U_URL', url);
			loadPlaylist(url);
		}
		else {
			loader(false);
			setPageLoaded(true);
			toast.error(t('PAGES.M3U.INVALID_URL'));
		}
	};

	if(!pageLoaded)
    return (
        <div className="d-flex align-items-center justify-content-center" style={{ backgroundColor: '#353535', width: '100vw', height: '100vh' }}>
            <Oval width={ 90 } height={ 90 } color='#c4c4c4' secondaryColor='#454545'/>
        </div>
    );

	return (<FocusContext.Provider value={ focusKey }>
		<div className="page d-flex flex-column justify-content-center align-items-center">
			<div className='languageSwitcherContainer'>
				<LanguageSwitcher/>
			</div>
			<span className="title-small fw-bold">{ ENV.APP_NAME }</span>
			<span className="text-small fw-bold">{ ENV.APP_WEB }</span>
			<span className="text-small mb-30" style={{ fontSize: '10pt' }}>({ ENV.APP_VERSION })</span>
			<div className="d-flex flex-row">
				<div className="m-30"><Keyboard forRef={ activeRef } onFocus={ () => setKeyboardFocused(true) } onBlur={ () => setKeyboardFocused(false) }/></div>
				<form className="m-30" style={{ width: 800 }} onSubmit={ handleSubmit }>
					<div className="form-group">
						<Input iref={ inputUrlRef } type="url" value={ inputUrlValue } onChange={ e => setInputUrlValue(e.target.value) } className={ "dark-input" + " " + ((activeRef === inputUrlRef && keyboardFocused) ? "dark-input-focused" : "") } id="m3u" placeholder={ t('COMMON.M3U_URL') }/>
					</div>
					<Button type="submit" className="dark-button">{ t('COMMON.CONTINUE') }</Button>
				</form>
			</div>
		</div>
	</FocusContext.Provider>);
}

export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common']))
		}
	};
}