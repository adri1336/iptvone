import Keyboard from "@/components/keyboard";
import {
  init,
  useFocusable,
  FocusContext
} from "@noriginmedia/norigin-spatial-navigation";
import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export function Header({ name1 }) {
  const { ref, focused } = useFocusable({});
  return (
    <div ref={ref} className={focused ? "button-focused" : "button"}>
      Press Me
    </div>
  );
}


export default () => {
	init({});

	const { ref, focusKey, setFocus, focusSelf } = useFocusable({
		isFocusBoundary: true
	});
	useEffect(() => {
		focusSelf();
	}, [focusSelf]);

	return (
		<div className="page d-flex flex-column justify-content-center align-items-center">
			<span className="title-big fw-bold">IPTV One</span>
			<Keyboard onKeyPressed={ (keyId, keyText) => console.log("keyId: " + keyId + " keyText: " + keyText) }/>
		</div>
	);
}

export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common']))
		}
	};
}