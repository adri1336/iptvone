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
    const [ selectedGroupIndex, setSelectedGroupIndex ] = useState(null);
    const [ playItem, setPlayItem ] = useState(null);
    const items = (IPTV.getItems()).filter(item => item.group.title === (IPTV.getGroups())[selectedGroupIndex]);
    
    useEffect(() => {
        if(IPTV.getURL().length <= 0)
        Router.replace('/');
    }, [IPTV.getURL()])

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    if(playItem) {
        const url = playItem.url.replace('/ts', '/m3u8').replace(".ts", ".m3u8");
        return <div className="page d-flex flex-column">
            <Player
                channelName={ playItem.name }
                url={ url}
                width='100vw'
                height='100vh'
                onClose={ () => setPlayItem(null) }
            />
        </div>
    }
    else {
        return (<FocusContext.Provider value={ focusKey }>
            <div className="page d-flex flex-row">
                <Sidebar onGroupSelected={ index => setSelectedGroupIndex(index) }/>
                <div className="mpage">
                    {
                        selectedGroupIndex === null ?
                            <div className="d-flex w-100 align-items-center justify-content-center">
                                <span className="text-medium fw-bold">{ t('PAGES.LIBRARY.SELECT_GROUP') }</span>
                            </div> :
                            <div className="d-flex flex-column">
                                <span className="title-small fw-bold mb-40">{ (IPTV.getGroups())[selectedGroupIndex] }</span>
                                <div className="d-flex flex-wrap">
                                    {
                                        items.slice(0, 20).map((item, index) => {
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
        </FocusContext.Provider>)
    }
};

export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common']))
		}
	};
}