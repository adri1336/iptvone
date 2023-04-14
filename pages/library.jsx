import Sidebar from "@/components/sidebar/sidebar";
import IPTV from "@/utils/iptv";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'next-i18next';
import Item from "@/components/item";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import Router from "next/router";
import Player from "@/components/player";
import Keyboard from "@/components/keyboard";
import Input from "@/components/input";
import Button from "@/components/button";
import FlatList from "flatlist-react";

export default () => {
    const { t } = useTranslation('common');
    const { focusKey, focusSelf } = useFocusable({});
    const [ selectedGroupIndex, setSelectedGroupIndex ] = useState(-1);
    const [ playItem, setPlayItem ] = useState(null);
    const [ lastItems, setLastItems ] = useState([]);
    const [ foundItems, setFoundItems ] = useState([]);
    const [ playedSeconds, setPlayedSeconds ] = useState(0);
    const items = selectedGroupIndex > -1 && (IPTV.getItems()).filter(item => item.group.title === (IPTV.getGroups())[selectedGroupIndex]);

    const [ keyboardFocused, setKeyboardFocused ] = useState(false);
	const [ activeRef, setActiveRef ] = useState(null);
	const inputSearchRef = useRef();
    
    useEffect(() => {
		if(inputSearchRef.current)
		setActiveRef(inputSearchRef);
	}, [inputSearchRef]);

    useEffect(() => {
        if(IPTV.getURL().length <= 0)
        Router.replace('/');
    }, [IPTV.getURL()])

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    useEffect(() => {
        if(typeof window !== 'undefined'){
            const items = localStorage.getItem('LAST_ITEMS');
            if(items) setLastItems(JSON.parse(items));
        }
    }, []);

    //save last 30 items in localstorage
    useEffect(() => {
        if(playItem) {
            const items = localStorage.getItem('LAST_ITEMS');
            let tmpLastItems = [], exists = false;
            if(items) {
                tmpLastItems = JSON.parse(items);
                exists = tmpLastItems.some(item => item.name === playItem.name);
            }

            if(!exists) {
                tmpLastItems.unshift(playItem);
                tmpLastItems = tmpLastItems.slice(0, 30);
                localStorage.setItem('LAST_ITEMS', JSON.stringify(tmpLastItems));
                setLastItems(tmpLastItems);
            }
            else {
                const index = tmpLastItems.findIndex(item => item.name === playItem.name);
                const item = tmpLastItems[index];
                
                if(item?.playedSeconds && item.playedSeconds > 0)
                setPlayedSeconds(item.playedSeconds);
            }
        }
    }, [playItem]);

    const handleSearch = e => {
        e.preventDefault();

        if(inputSearchRef?.current) {
            const value = inputSearchRef.current.value;
            if(value.length > 0) {
                const items = IPTV.getItems();
                const found = items.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
                setFoundItems(found);
            }
        }
    };

    const savePlayItemProgress = (item, progress) => {
        const items = localStorage.getItem('LAST_ITEMS');
        if(items) {
            const tmpLastItems = JSON.parse(items);
            const index = tmpLastItems.findIndex(i => i.name === item.name);
            if(index > -1) {
                tmpLastItems[index].playedSeconds = progress.playedSeconds;
                tmpLastItems.unshift(tmpLastItems.splice(index, 1)[0]);
                localStorage.setItem('LAST_ITEMS', JSON.stringify(tmpLastItems));
                setLastItems(tmpLastItems);
            }
        }
    };
    
    return (<FocusContext.Provider value={ focusKey }>
        {
            playItem &&
            <div style={{ position: 'fixed', top: 0, left: 0 }}>
                <Player
                    channelName={ playItem.name }
                    url={ playItem.url.replace('/ts', '/m3u8').replace(".ts", ".m3u8") }
                    width='100vw'
                    height='100vh'
                    onClose={ () => { setPlayedSeconds(0); setPlayItem(null); } }
                    onProgress={ progress => savePlayItemProgress(playItem, progress) }
                    playedSeconds={ playedSeconds }
                />
            </div>
        }
        <div className="page d-flex flex-row" style={{ visibility: playItem ? 'hidden' : 'visible' }}>
            <Sidebar onGroupSelected={ index => setSelectedGroupIndex(index) }/>
            <div className="mpage">
                {
                    selectedGroupIndex === -1 ?
                        <div className="d-flex flex-column">
                            <div className="d-flex flex-column m-30">
                                <span className="text-medium fw-bold">{ t('COMMON.INFO') }</span>
                                <span className="text-small">{ t('PAGES.LIBRARY.INFO', { items: IPTV.getItems().length, groups: IPTV.getGroups().length, url: IPTV.getURL() }) }</span>
                                <Button type="button" className="dark-button" onClick={ () => Router.replace('/?change=true') }>{ t('PAGES.LIBRARY.CHANGE_URL') }</Button>
                            </div>

                            <div className="d-flex flex-column m-30">
                                <span className="text-medium fw-bold">{ t('PAGES.LIBRARY.LAST_PLAYED') }</span>
                                <Button type="button" className="dark-button" onClick={ () => {
                                    setLastItems([]);
                                    localStorage.removeItem('LAST_ITEMS');
                                } }>{ t('PAGES.LIBRARY.DELETE_HISTORY') }</Button>
                                <div className="d-flex flex-wrap">
                                    <FlatList
                                        renderOnScroll
                                        list={ lastItems }
                                        renderItem={
                                            (item, index) => {
                                                return <Item
                                                    key={ index }
                                                    item={ item }
                                                    onSelected={ () => setPlayItem(item) }
                                                />
                                            }
                                        }
                                    />
                                </div>
                            </div>

                            <div className="d-flex flex-column m-30">
                                <span className="text-medium fw-bold">{ t('PAGES.LIBRARY.SEARCH') }</span>
                                <div className="d-flex flex-row mt-10">
                                    <Keyboard forRef={ activeRef } onFocus={ () => setKeyboardFocused(true) } onBlur={ () => setKeyboardFocused(false) }/>
                                    <form className="ml-10" style={{ width: 600 }} onSubmit={ handleSearch }>
                                        <div className="form-group">
                                            <Input iref={ inputSearchRef } type="text" className={ "dark-input" + " " + ((activeRef === inputSearchRef && keyboardFocused) ? "dark-input-focused" : "") } id="m3u" placeholder={ t('COMMON.TITLE') }/>
                                        </div>
                                        <Button type="submit" className="dark-button">{ t('COMMON.CONTINUE') }</Button>
                                        <Button type="button" className="dark-button" onClick={ () => setFoundItems([]) }>{ t('PAGES.LIBRARY.CLEAR_SEARCH') }</Button>
                                    </form>
                                </div>
                                <div className="d-flex flex-wrap mt-10">
                                    <FlatList
                                        renderOnScroll
                                        list={ foundItems }
                                        renderItem={
                                            (item, index) => {
                                                return <Item
                                                    key={ index }
                                                    item={ item }
                                                    onSelected={ () => setPlayItem(item) }
                                                />
                                            }
                                        }
                                    />
                                </div>
                            </div>
                        </div> :
                        <div className="d-flex flex-column">
                            <span className="title-small fw-bold mb-40">{ (IPTV.getGroups())[selectedGroupIndex] }</span>
                            <div className="d-flex flex-wrap justify-content-center">
                                <FlatList
                                    renderOnScroll
                                    list={ items }
                                    renderItem={
                                        (item, index) => {
                                            return <Item
                                                key={ index }
                                                item={ item }
                                                onSelected={ () => setPlayItem(item) }
                                            />
                                        }
                                    }
                                />
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