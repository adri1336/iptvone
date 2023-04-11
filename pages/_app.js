import 'bootstrap/dist/css/bootstrap.css'
import '@/styles/globals.css'
import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import { init } from "@noriginmedia/norigin-spatial-navigation";

const App = ({ Component, pageProps }) => {
	init({});
	
	useEffect(() => {
		import('bootstrap/dist/js/bootstrap');
	}, []);

	return <Component {...pageProps} />
}

export default appWithTranslation(App)