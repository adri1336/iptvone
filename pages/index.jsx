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

export default () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { focusKey, setFocus, focusSelf } = useFocusable({});

	const [ keyboardFocused, setKeyboardFocused ] = useState(false);
	const [ activeRef, setActiveRef ] = useState(null);
	const [ inputUrlValue, setInputUrlValue ] = useState('');
	const inputUrlRef = useRef();

	useEffect(() => {
		if(router.isReady && typeof window !== 'undefined') {
			const { change } = router.query;

			const URL = localStorage.getItem('M3U_URL');
			setInputUrlValue(URL);
			if(!change) {
				loader(true, { message: t('PAGES.M3U.LOAD_MESSAGE'), opacity: 1.0, logo: true });				
				if(URL) loadPlaylist(URL);
				else loader(false);
			}
		}
    }, [router.query]);

	const loadPlaylist = async url => {
		const res = await fetch(url);
		if(res.ok) {
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
		else {
			loader(false);
			toast.error(t('PAGES.M3U.LOAD_ERROR'));
		}
	};

    useEffect(() => {
        setFocus('keyboard');
    }, [focusSelf]);

	useEffect(() => {
		if(inputUrlRef.current)
		setActiveRef(inputUrlRef);
	}, [inputUrlRef]);

	const handleSubmit = (e) => {
		e.preventDefault();
		loader(true);
		const url = inputUrlRef.current.value;
		localStorage.setItem('M3U_URL', url);
		loadPlaylist(url);
	};

	return (<FocusContext.Provider value={ focusKey }>
		<div className="page d-flex flex-column justify-content-center align-items-center">
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