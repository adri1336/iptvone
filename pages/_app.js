import 'bootstrap/dist/css/bootstrap.css'
import '@/styles/globals.css'
import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import { init } from "@noriginmedia/norigin-spatial-navigation";
import Loader from "@/components/loader/loaderContainer";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const App = ({ Component, pageProps }) => {
	init({});
	
	useEffect(() => {
		import('bootstrap/dist/js/bootstrap');
	}, []);

	return <>
		<Loader/>
		<Component {...pageProps} />
		<ToastContainer theme="dark"/>
	</>;
}

export default appWithTranslation(App)