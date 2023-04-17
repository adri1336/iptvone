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
import { toast } from 'react-toastify';
import LanguageSwitcher from "@/components/languageswitcher";
import { useRouter } from 'next/router';

export default () => {
    const router = useRouter();
    const { focusKey, focusSelf, setFocus, getCurrentFocusKey } = useFocusable({});
    const [ lastFocused, setLastFocused ] = useState(null);
    const [ lastFocusedCollection, setLastFocusedCollection ] = useState(null);
    const [ selectedGroupIndex, setSelectedGroupIndex ] = useState(-1);
    const [ playItem, setPlayItem ] = useState(null);
    const [ collection, setCollection ] = useState(null);
    const [ playedSeconds, setPlayedSeconds ] = useState(0);
    
    useEffect(() => {
        if(typeof window !== 'undefined') {
			const lang = localStorage.getItem('LANGUAGE');
			if(lang) router.push(router.asPath, router.asPath, { locale: lang });
		}
    }, []);

    useEffect(() => {
        if(typeof window !== 'undefined' && !collection && !playItem && selectedGroupIndex > -1) {
            const handleKeyDown = (e) => {
                const keyCode = e.keyCode || e.which;
                if(keyCode === 461 /* LG Back Button */ || keyCode === 10009 /* Samsung Back Button */ || keyCode === 27 /* Esc */)
                setSelectedGroupIndex(-1);
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [collection, playItem, selectedGroupIndex]);

    useEffect(() => {
        if(typeof window !== 'undefined') {
            window.scrollTo({ top: -100, behavior: 'instant' });
        }
    }, [selectedGroupIndex]);

    useEffect(() => {
        if(IPTV.getURL().length <= 0)
        Router.replace('/');
    }, [IPTV.getURL()])

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    useEffect(() => {
        if(!collection) {
            if(lastFocusedCollection) {
                if(lastFocusedCollection.includes('found_item')) setFocus('keyboard');
                else setFocus(lastFocusedCollection);
            }
        }
    }, [collection]);

    useEffect(() => {
        if(playItem) {
            setLastFocused(getCurrentFocusKey());
            
            const items = localStorage.getItem('LAST_ITEMS');
            let tmpLastItems = [], exists = false;
            if(items) {
                tmpLastItems = JSON.parse(items);
                exists = tmpLastItems.some(item => item.name === playItem.name || (playItem?.isCollection && item?.tvName === playItem?.tvName));
            }

            if(!exists) {
                tmpLastItems.unshift(playItem);
                tmpLastItems = tmpLastItems.slice(0, 30);
                localStorage.setItem('LAST_ITEMS', JSON.stringify(tmpLastItems));
            }
            else {
                const index = tmpLastItems.findIndex(item => item.name === playItem.name || item?.tvName === playItem?.tvName);
                const item = tmpLastItems[index];
                if(item?.isCollection) {
                    if(item.season != playItem.season || item.episode != playItem.episode)
                    item.playedSeconds = 0;

                    item.name = playItem.name;
                    item.season = playItem.season;
                    item.episode = playItem.episode;
                    localStorage.setItem('LAST_ITEMS', JSON.stringify(tmpLastItems));
                }

                if(item?.playedSeconds && item.playedSeconds > 0)
                setPlayedSeconds(item.playedSeconds);
            }
        }
        else {
            if(lastFocused)
            setFocus(lastFocused);
        }
    }, [playItem]);

    //save last 30 items in localstorage
    const savePlayItemProgress = (item, progress) => {
        const items = localStorage.getItem('LAST_ITEMS');
        if(items) {
            const tmpLastItems = JSON.parse(items);
            const index = tmpLastItems.findIndex(i => i.name === item.name || i?.tvName === item?.tvName);
            if(index > -1) {
                tmpLastItems[index].playedSeconds = progress.playedSeconds;
                if(tmpLastItems[index].isCollection) {
                    tmpLastItems[index].url = item.url;
                    tmpLastItems[index].tvg = item.tvg;
                    tmpLastItems[index].name = item.name;
                    tmpLastItems[index].season = item.season;
                    tmpLastItems[index].episode = item.episode;
                }
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
                    onEnded={
                        () => {
                            if(playItem?.isCollection && collection) {
                                //get next episode
                                const episodes = collection.episodes;
                                const currentEpisodeIndex = episodes.findIndex(episode => episode.season === playItem.season && episode.episode === playItem.episode);
                                if(currentEpisodeIndex > -1) {
                                    const nextEpisodeIndex = currentEpisodeIndex + 1;
                                    if(nextEpisodeIndex < episodes.length) {
                                        const nextEpisode = episodes[nextEpisodeIndex];
                                        savePlayItemProgress(nextEpisode, { playedSeconds: 0 });
                                    }
                                }
                            }
                            setPlayedSeconds(0);
                            setPlayItem(null);
                        }
                    }
                    onProgress={ progress => savePlayItemProgress(playItem, progress) }
                    playedSeconds={ playedSeconds }
                />
            </div>
        }
        <div className="page d-flex flex-row" style={{ visibility: playItem ? 'hidden' : 'visible' }}>
            {
                collection === null ? <>
                    <Sidebar onGroupSelected={ index => setSelectedGroupIndex(index) } selectedIndex={ selectedGroupIndex }/>
                    {
                        selectedGroupIndex === -1 ?
                            <StartPage playItem={ playItem } onPlay={ item => {
                                if(item?.isCollection) {
                                    setLastFocusedCollection(getCurrentFocusKey());
                                    setCollection(item);
                                }
                                else setPlayItem(item);
                            } }/> :
                            <GroupPage
                                selectedGroupIndex={ selectedGroupIndex }
                                onPlay={ item => {
                                    if(item?.isCollection) {
                                        setLastFocusedCollection(getCurrentFocusKey());
                                        setCollection(item);
                                    }
                                    else setPlayItem(item);
                                } }
                            />
                    }
                </> :
                    <CollectionPage
                        collection={ collection }
                        onBack={ () => setCollection(null) }
                        playItem={ playItem }
                        onPlay={ item => setPlayItem(item) }
                    />
            }
        </div>
    </FocusContext.Provider>);
};

const CollectionPage = ({ collection, onBack, playItem, onPlay }) => {
    const { t } = useTranslation('common');
    const [ currentItem, setCurrentItem ] = useState(null);
    const { ref, focusSelf, setFocus } = useFocusable({
        isFocusBoundary: true
    });

    useEffect(() => {
        if(typeof window !== 'undefined' && !playItem) {
            const handleKeyDown = (e) => {
                const keyCode = e.keyCode || e.which;
                if(keyCode === 461 /* LG Back Button */ || keyCode === 10009 /* Samsung Back Button */ || keyCode === 27 /* Esc */)
                onBack();
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [playItem]);

    useEffect(() => {
        setFocus('go_back');
    }, [focusSelf]);

    useEffect(() => {
        const items = localStorage.getItem('LAST_ITEMS');
        let tmpLastItems = [], exists = false;
        if(items) {
            tmpLastItems = JSON.parse(items);
            exists = tmpLastItems.some(item => item?.tvName === collection.tvName);
        }

        if(exists) {
            const index = tmpLastItems.findIndex(item => item?.tvName === collection.tvName);
            const item = tmpLastItems[index];
            setCurrentItem(item);
        }
    }, [playItem]);

    let playedSecondsString = "";
    if(currentItem && currentItem?.playedSeconds > 0)
    playedSecondsString = new Date(currentItem.playedSeconds * 1000).toISOString().slice(11, 19);

    //episodes format: { seasons, episode, url, logo }
    const episodes = collection?.episodes;

    //extract seasons from episodes
    const seasons = episodes?.map(episode => episode.season).filter((season, index, self) => self.indexOf(season) === index);

    return (
        <div ref={ ref } className="page">
            <div className="d-flex flex-column m-30" style={{ width: 'calc(100% - 90px)' }}>
                <span className="title-small fw-bold">{ collection.tvName }</span>
                <span className="text-small">{ t('PAGES.LIBRARY.TOTAL_EPISODES', { episodes: collection.episodes.length }) }</span>
                <Button focusKey={ 'go_back' } type="button" className="dark-button mb-40" onClick={ () => onBack() }>{ t('PAGES.LIBRARY.GO_BACK') }</Button>
                <span className="text-medium fw-bold mb-10">{ t('PAGES.LIBRARY.CURRENT_PROGRESS') }</span>
                {
                    currentItem ?
                        <div className="d-flex flex-column mb-40">
                            <span className="text-small">{ t('COMMON.SEASON') + ': ' + currentItem.season }</span>
                            <span className="text-small">{ t('COMMON.EPISODE') + ': ' + currentItem.episode }</span>
                            <span className="text-small">{ t('COMMON.TIME') + ': ' + (playedSecondsString === "" ? t('PAGES.LIBRARY.NO_PROGRESS').toLowerCase() : playedSecondsString) }</span>
                            <Button type="button" className="dark-button mt-10" onClick={ () => onPlay(currentItem) }>{ t('COMMON.PLAY') }</Button>
                        </div> :
                        <span className="text-small mb-40">{ t('PAGES.LIBRARY.NO_PROGRESS') }</span>
                }
                {
                    //extraer todas las temporadas distintas de episodes y mostrarlas
                    seasons.map(season => {
                        const seasonEpisodes = episodes.filter(episode => episode.season === season);
                        return (
                            <div key={ season } className="d-flex flex-column">
                                <span className="text-medium fw-bold mb-10">{ t('COMMON.SEASON') + ' ' + season }</span>
                                <div className="d-flex flex-wrap justify-content-start">
                                    <FlatList
                                        renderOnScroll
                                        renderWhenEmpty={ () => <></> }
                                        list={ seasonEpisodes }
                                        renderItem={
                                            (item, index) => {
                                                const passedItem = {
                                                    name: item.name,
                                                    tvg: item?.tvg,
                                                    url: item.url,
                                                    season: item.season,
                                                    episode: item.episode
                                                };
                                                return <Item
                                                    key={ index }
                                                    item={ passedItem }
                                                    onSelected={ () => onPlay(item) }
                                                />
                                            }
                                        }
                                    />
                                </div>
                            </div>
                        );
                    })

                }
            </div>
        </div>
    );
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
            if(items) {
                const tmpLastItems = JSON.parse(items);
                const allItems = IPTV.getItems();

                //add episodes to last items if is a collection
                tmpLastItems.forEach(item => {
                    if(item?.isCollection) {
                        const tvName = item.tvName;
                        let episodes = [];
                        allItems.filter(i => i.name.includes(tvName)).forEach(searchItem => {
                            const match = searchItem.name.match(/S(\d+)E(\d+)/);
                            if(match) {
                                const searchItemTvName = searchItem.name.replace(/S(\d+)E(\d+)/, '').trim();
                                if(searchItemTvName === tvName) {
                                    const season = parseInt(match[1]);
                                    const episode = parseInt(match[2]);
                                    episodes.push({ season, episode, name: searchItem.name, url: searchItem.url, tvg: searchItem?.tvg, tvName: tvName, isCollection: true });
                                }
                            }
                        });
                        item.episodes = episodes;
                    }
                });
                setLastItems(tmpLastItems);
            }
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
                const searchValue = value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
                let foundItems = items.filter(item => item.name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(searchValue));
                if(foundItems.length > 0) {
                    //agrupar items que sean series (SxxExx) en una sola entrada
                    const groupedItems = [];
                    foundItems.forEach(item => {
                        const match = item.name.match(/S(\d+)E(\d+)/);
                        if(match) {
                            const tvName = item.name.replace(/S(\d+)E(\d+)/, '').trim();
                            const season = parseInt(match[1]);
                            const episode = parseInt(match[2]);
                            const found = groupedItems.find(item => item.name.replace(/S(\d+)E(\d+)/, '').trim() === tvName);
                            if(found) {
                                found.isCollection = true;
                                found.episodes.push({ season, episode, name: item.name, url: item.url, tvg: item?.tvg, tvName: tvName, isCollection: true });
                            } else {
                                groupedItems.push({
                                    ...item,
                                    tvName: tvName,
                                    episodes: [{ season, episode, name: item.name, url: item.url, tvg: item?.tvg, tvName: tvName, isCollection: true }],
                                });
                            }
                        } else {
                            groupedItems.push(item);
                        }
                    });
                    foundItems = groupedItems;
                    setFoundItems(foundItems);
                }
                else toast.error(t('PAGES.LIBRARY.NO_ITEMS_FOUND'));
            }
        }
    };

    return (
        <div ref={ ref } className="mpage">
            <div className="d-flex flex-column" style={{ marginTop: 80 }}>
                <div className="d-flex flex-column m-30">
                    <span className="text-medium fw-bold">{ t('COMMON.INFO') }</span>
                    <span className="text-small">{ t('PAGES.LIBRARY.INFO', { items: IPTV.getItems().length, groups: IPTV.getGroups().length, url: IPTV.getURL() }) }</span>
                    <Button focusKey={ 'change_url' } onFocus={ () => setLastFocused('change_url') } type="button" className="dark-button" onClick={ () => Router.replace('/?change=true') }>{ t('PAGES.LIBRARY.CHANGE_URL') }</Button>
                    <div className='languageSwitcherContainer'>
                        <LanguageSwitcher/>
                    </div>
                </div>

                <div className="d-flex flex-column m-30">
                    <span className="text-medium fw-bold">{ t('PAGES.LIBRARY.LAST_PLAYED') }</span>
                    <Button focusKey={ 'clear_history' } onFocus={ () => setLastFocused('clear_history') } type="button" className="dark-button" onClick={ () => {
                        setLastItems([]);
                        localStorage.removeItem('LAST_ITEMS');
                    } }>{ t('PAGES.LIBRARY.DELETE_HISTORY') }</Button>
                    <div className="d-flex flex-wrap justify-content-start">
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
                                <div className="d-flex flex-wrap justify-content-start mt-10">
                                    <FlatList
                                        renderOnScroll
                                        renderWhenEmpty={ () => <></> }
                                        list={ foundItems }
                                        renderItem={
                                            (item, index) => {
                                                if(item?.isCollection)
                                                item.name = item?.tvName;

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
    let items = (IPTV.getItems()).filter(item => item.group.title === (IPTV.getGroups())[selectedGroupIndex]);
    //agrupar items que sean series (SxxExx) en una sola entrada
    const groupedItems = [];
    items.forEach(item => {
        const match = item.name.match(/S(\d+)E(\d+)/);
        if(match) {
            const tvName = item.name.replace(/S(\d+)E(\d+)/, '').trim();
            const season = parseInt(match[1]);
            const episode = parseInt(match[2]);
            const found = groupedItems.find(item => item.name.replace(/S(\d+)E(\d+)/, '').trim() === tvName);
            if(found) {
                found.isCollection = true;
                found.episodes.push({ season, episode, name: item.name, url: item.url, tvg: item?.tvg, tvName: tvName, isCollection: true });
            } else {
                groupedItems.push({
                    ...item,
                    tvName: tvName,
                    episodes: [{ season, episode, name: item.name, url: item.url, tvg: item?.tvg, tvName: tvName, isCollection: true }],
                });
            }
        } else {
            groupedItems.push(item);
        }
    });
    items = groupedItems;

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
                                if(item?.isCollection)
                                item.name = item?.tvName;

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