import Sidebar from "@/components/sidebar/sidebar";
import IPTV from "@/utils/iptv";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import Item from "@/components/item";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import Router from "next/router";
import Player from "@/components/player";

export default () => {
    const { t } = useTranslation('common');
    const { focusKey, focusSelf } = useFocusable({});
    const [ selectedGroupIndex, setSelectedGroupIndex ] = useState(-1);
    const [ playItem, setPlayItem ] = useState(null);
    const items = selectedGroupIndex > -1 && (IPTV.getItems()).filter(item => item.group.title === (IPTV.getGroups())[selectedGroupIndex]);
    
    useEffect(() => {
        if(IPTV.getURL().length <= 0)
        Router.replace('/');
    }, [IPTV.getURL()])

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    
    return (<FocusContext.Provider value={ focusKey }>
        {
            playItem &&
            <div style={{ position: 'fixed', top: 0, left: 0 }}>
                <Player
                    channelName={ playItem.name }
                    url={ playItem.url.replace('/ts', '/m3u8').replace(".ts", ".m3u8") }
                    width='100vw'
                    height='100vh'
                    onClose={ () => setPlayItem(null) }
                />
            </div>
        }
        <div className="page d-flex flex-row" style={{ visibility: playItem ? 'hidden' : 'visible' }}>
            <Sidebar onGroupSelected={ index => setSelectedGroupIndex(index) }/>
            <div className="mpage">
                {
                    selectedGroupIndex === -1 ?
                        <div className="d-flex flex-column w-100 align-items-center justify-content-center">
                            <span className="text-medium fw-bold">{ t('PAGES.LIBRARY.SELECT_GROUP') }</span>
                            <span className="text-small">{ IPTV.getURL() }</span>
                        </div> :
                        <div className="d-flex flex-column">
                            <span className="title-small fw-bold mb-40">{ (IPTV.getGroups())[selectedGroupIndex] }</span>
                            <div className="d-flex flex-wrap">
                                {
                                    items.map((item, index) => {
                                        return <Item
                                            key={ index }
                                            item={ item }
                                            onSelected={ () => setPlayItem(item) }
                                        />
                                    })
                                }
                            </div>
                        </div>
                }
            </div>
        </div>
    </FocusContext.Provider>);
};

export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common']))
		}
	};
}