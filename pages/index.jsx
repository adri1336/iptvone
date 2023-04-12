import Keyboard from "@/components/keyboard";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ENV from "@/utils/env";
import { useRef } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import { useTranslation } from 'next-i18next';

export default () => {
	const { t } = useTranslation('common');
	const { focusKey, focusSelf } = useFocusable({});

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

	const [ keyboardFocused, setKeyboardFocused ] = useState(false);
	const [ activeRef, setActiveRef ] = useState(null);
	const inputUrlRef = useRef();

	useEffect(() => {
		if(inputUrlRef.current)
		setActiveRef(inputUrlRef);
	}, [inputUrlRef]);

	return (<FocusContext.Provider value={ focusKey }>
		<div className="page d-flex flex-column justify-content-center align-items-center">
			<span className="text-medium fw-bold m-30">{ ENV.APP_NAME }</span>
			<div className="d-flex flex-row">
				<div className="m-30"><Keyboard forRef={ activeRef } onFocus={ () => setKeyboardFocused(true) } onBlur={ () => setKeyboardFocused(false) }/></div>
				<form className="m-30" style={{ width: 300 }}>
					<div className="form-group">
						<Input iref={ inputUrlRef } type="url" className={ "dark-input" + " " + ((activeRef === inputUrlRef && keyboardFocused) ? "dark-input-focused" : "") } id="m3u" placeholder={ t('COMMON.M3U_URL') }/>
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