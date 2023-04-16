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
    const { focusKey, focusSelf, setFocus, getCurrentFocusKey } = useFocusable({});
    const [ lastFocused, setLastFocused ] = useState(null);
    const [ selectedGroupIndex, setSelectedGroupIndex ] = useState(-1);
    const [ playItem, setPlayItem ] = useState(null);
    const [ playedSeconds, setPlayedSeconds ] = useState(0);
    
    useEffect(() => {
        if(typeof window !== 'undefined') {
            window.scrollTo(0, -100);
        }
    }, [selectedGroupIndex]);

    useEffect(() => {
        if(IPTV.getURL().length <= 0)
        Router.replace('/');
    }, [IPTV.getURL()])

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    //save last 30 items in localstorage
    useEffect(() => {
        if(playItem) {
            setLastFocused(getCurrentFocusKey());
            
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
            }
            else {
                const index = tmpLastItems.findIndex(item => item.name === playItem.name);
                const item = tmpLastItems[index];
                
                if(item?.playedSeconds && item.playedSeconds > 0)
                setPlayedSeconds(item.playedSeconds);
            }
        }
        else {
            if(lastFocused)
            setFocus(lastFocused);
        }
    }, [playItem]);

    const savePlayItemProgress = (item, progress) => {
        const items = localStorage.getItem('LAST_ITEMS');
        if(items) {
            const tmpLastItems = JSON.parse(items);
            const index = tmpLastItems.findIndex(i => i.name === item.name);
            if(index > -1) {
                tmpLastItems[index].playedSeconds = progress.playedSeconds;
                tmpLastItems.unshift(tmpLastItems.splice(index, 1)[0]);
                localStorage.setItem('LAST_ITEMS', JSON.stringify(tmpLastItems));
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
            {
                selectedGroupIndex === -1 ?
                    <StartPage playItem={ playItem } onPlay={ item => setPlayItem(item) }/> :
                    <GroupPage
                        selectedGroupIndex={ selectedGroupIndex }
                        onPlay={ item => setPlayItem(item) }
                    />
            }
        </div>
    </FocusContext.Provider>);
};

const StartPage = ({ playItem, onPlay }) => {
    const { t } = useTranslation('common');
    const [ lastFocused, setLastFocused ] = useState('change_url');
    const { ref, setFocus, getCurrentFocusKey } = useFocusable({
        onFocus: () => {
            if(getCurrentFocusKey() !== lastFocused) {
                setFocus(lastFocused);
            }
        }
    });

    const [ lastItems, setLastItems ] = useState([]);
    const [ foundItems, setFoundItems ] = useState([]);
    const [ keyboardFocused, setKeyboardFocused ] = useState(false);
    const [ activeRef, setActiveRef ] = useState(null);
    const inputSearchRef = useRef();
    
    useEffect(() => {
        if(typeof window !== 'undefined'){
            const items = localStorage.getItem('LAST_ITEMS');
            if(items) setLastItems(JSON.parse(items));
        }
    }, [playItem]);

    useEffect(() => {
        if(inputSearchRef.current)
        setActiveRef(inputSearchRef);
    }, [inputSearchRef]);

    useEffect(() => {
        if(foundItems.length > 0) setFocus('clear_search');
        else setFocus('keyboard');
    }, [foundItems]);

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

    return (
        <div ref={ ref } className="mpage">
            <div className="d-flex flex-column">
                <div className="d-flex flex-column m-30">
                    <span className="text-medium fw-bold">{ t('COMMON.INFO') }</span>
                    <span className="text-small">{ t('PAGES.LIBRARY.INFO', { items: IPTV.getItems().length, groups: IPTV.getGroups().length, url: IPTV.getURL() }) }</span>
                    <Button focusKey={ 'change_url' } onFocus={ () => setLastFocused('change_url') } type="button" className="dark-button" onClick={ () => Router.replace('/?change=true') }>{ t('PAGES.LIBRARY.CHANGE_URL') }</Button>
                </div>

                <div className="d-flex flex-column m-30">
                    <span className="text-medium fw-bold">{ t('PAGES.LIBRARY.LAST_PLAYED') }</span>
                    <Button focusKey={ 'clear_history' } onFocus={ () => setLastFocused('clear_history') } type="button" className="dark-button" onClick={ () => {
                        setLastItems([]);
                        localStorage.removeItem('LAST_ITEMS');
                    } }>{ t('PAGES.LIBRARY.DELETE_HISTORY') }</Button>
                    <div className="d-flex flex-wrap">
                        <FlatList
                            renderOnScroll
                            renderWhenEmpty={ () => <></> }
                            list={ lastItems }
                            renderItem={
                                (item, index) => {
                                    return <Item
                                        key={ index }
                                        item={ item }
                                        onSelected={ () => onPlay(item) }
                                        focusKey={ 'last_item_' + index }
                                        onFocus={ () => setLastFocused('last_item_' + index) }
                                    />
                                }
                            }
                        />
                    </div>
                </div>

                <div className="d-flex flex-column m-30">
                    <span className="text-medium fw-bold">{ t('PAGES.LIBRARY.SEARCH') }</span>
                    {
                        foundItems.length === 0 ?
                            <div className="d-flex flex-row mt-10">
                                <Keyboard
                                    forRef={ activeRef }
                                    onFocus={ () => {
                                        if(lastFocused === 'change_url') setFocus('group_start');
                                        else {
                                            setLastFocused('keyboard');
                                            setKeyboardFocused(true);
                                        }
                                    } }
                                    onBlur={ () => setKeyboardFocused(false) }/>
                                <form className="ml-10" style={{ width: 600 }} onSubmit={ handleSearch }>
                                    <div className="form-group">
                                        <Input iref={ inputSearchRef } type="text" className={ "dark-input" + " " + ((activeRef === inputSearchRef && keyboardFocused) ? "dark-input-focused" : "") } id="m3u" placeholder={ t('COMMON.TITLE') }/>
                                    </div>
                                    <Button focusKey={ 'search' } onFocus={ () => setLastFocused('search') } type="submit" className="dark-button">{ t('COMMON.CONTINUE') }</Button>
                                </form>
                            </div> :
                            <>
                                <Button focusKey={ 'clear_search' } onFocus={ () => setLastFocused('clear_search') } type="button" className="dark-button" onClick={ () => setFoundItems([]) }>{ t('PAGES.LIBRARY.CLEAR_SEARCH') }</Button>
                                <div className="d-flex flex-wrap mt-10">
                                    <FlatList
                                        renderOnScroll
                                        renderWhenEmpty={ () => <></> }
                                        list={ foundItems }
                                        renderItem={
                                            (item, index) => {
                                                return <Item
                                                    key={ index }
                                                    item={ item }
                                                    onSelected={ () => onPlay(item) }
                                                    focusKey={ 'found_item_' + index }
                                                    onFocus={ () => setLastFocused('found_item_' + index) }
                                                />
                                            }
                                        }
                                    />
                                </div>
                            </>
                    }
                </div>
            </div>
        </div>
    );
};

const GroupPage = ({ selectedGroupIndex, onPlay }) => {
    const items = (IPTV.getItems()).filter(item => item.group.title === (IPTV.getGroups())[selectedGroupIndex]);
    const [ lastFocused, setLastFocused ] = useState('item_0');
    const { ref, setFocus, getCurrentFocusKey } = useFocusable({
        onFocus: () => {
            if(getCurrentFocusKey() !== lastFocused) {
                setFocus(lastFocused);
            }
        }
    });

    useEffect(() => {
        setLastFocused('item_0');
    }, [selectedGroupIndex]);
    
    return (
        <div ref={ ref } className="mpage">
            <div className="d-flex flex-column">
                <span className="title-small fw-bold mb-40">{ (IPTV.getGroups())[selectedGroupIndex] }</span>
                <div className="d-flex flex-wrap justify-content-center">
                    <FlatList
                        renderOnScroll
                        renderWhenEmpty={ () => <></> }
                        list={ items }
                        renderItem={
                            (item, index) => {
                                return <Item
                                    key={ index }
                                    item={ item }
                                    onSelected={ () => onPlay(item) }
                                    focusKey={ `item_${ index }` }
                                    onFocus={ () => setLastFocused(`item_${ index }`) }
                                />
                            }
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common']))
		}
	};
}