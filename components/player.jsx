import { createRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import styles from "@/styles/player.module.css";
import { FaPlay, FaPause } from "react-icons/fa";
import { MdReplay } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { useTranslation } from 'next-i18next';
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";

const Control = ({ icon, text, onClick, setControls }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => {
            setControls(true);
            if(onClick)
            onClick();
        },
        onFocus: () => setControls(true)
    });

    return (
        <div ref={ ref } className={ styles.control + " " +  (focused ? styles.controlfocused : "") + " d-flex flex-column justify-content-center align-items-center" } onClick={ () => onClick() }>
            { icon }
            <span className={ "text-small fw-bold m-10" }>{ text }</span>
        </div>
    );
};

const PlayerControls = ({ playerProps, onAction, isStream }) => {
    const [ controls, setControls ] = useState(true);
    useEffect(() => {
        if(controls) {
            const timer = window.setInterval(() => {
                setControls(false);
            }, 3000);

            return () => { 
                window.clearInterval(timer);
            }
        }
    }, [controls]);

    const { t } = useTranslation('common');
    const { ref, focusKey, focusSelf } = useFocusable({
        onFocus: () => {
            setControls(true);
        },
        onBlur: () => {
            setControls(false);
        }
    });

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    return (<FocusContext.Provider value={ focusKey }>
        { !controls && <div className={ styles.showControls } onMouseMove={ () => setControls(true) }/> }
        { !controls && <div className={ styles.hideControls }/> }
        <div ref={ ref } className={ styles.controls + " d-flex flex-column justify-content-between" } style={{ width: playerProps.width, height: playerProps.height, zIndex: controls ? 100 : 0 }}>
            <span className="text-small fw-bold text-center">{ playerProps.channelName }</span>
            <div className="d-flex flex-row justify-content-between">
                <div className="d-flex">
                    {
                        playerProps.playing ?
                            <Control
                                icon={ <FaPause/> }
                                text={ t('COMPONENTS.PLAYER.PAUSE') }
                                onClick={ () => onAction('pause') }
                                setControls={ setControls }
                            />
                        :
                            <Control
                                icon={ <FaPlay/> }
                                text={ t('COMPONENTS.PLAYER.PLAY') }
                                onClick={ () => onAction('play') }
                                setControls={ setControls }
                            />
                    }
                    <Control
                        icon={ <MdReplay/> }
                        text={ t('COMPONENTS.PLAYER.REPLAY') }
                        onClick={ () => onAction('replay') }
                        setControls={ setControls }
                    />
                </div>
                {
                    !isStream &&
                    <div className="d-flex">
                        <Control
                            text={ '-20m' }
                            onClick={ () => onAction('seek:-20m') }
                            setControls={ setControls }
                        />
                        <Control
                            text={ '-5m' }
                            onClick={ () => onAction('seek:-5m') }
                            setControls={ setControls }
                        />
                        <Control
                            text={ '-30s' }
                            onClick={ () => onAction('seek:-30s') }
                            setControls={ setControls }
                        />
                        <Control
                            text={ '+30s' }
                            onClick={ () => onAction('seek:+30s') }
                            setControls={ setControls }
                        />
                        <Control
                            text={ '+5m' }
                            onClick={ () => onAction('seek:+5m') }
                            setControls={ setControls }
                        />
                        <Control
                            text={ '+20m' }
                            onClick={ () => onAction('seek:+20m') }
                            setControls={ setControls }
                        />
                    </div>
                }
                <Control
                    icon={ <MdClose/> }
                    text={ t('COMPONENTS.PLAYER.EXIT') }
                    onClick={ () => onAction('close') }
                    setControls={ setControls }
                />
            </div>
        </div>
    </FocusContext.Provider>);
};

const Player = (props) => {
    const isStream = props.url.includes('m3u');
    const [ windowLoaded, setWindowLoaded ] = useState(false);
    const [ playing, setPlaying ] = useState(isStream);
    const [ duration, setDuration ] = useState(null);
    const playerRef = createRef();

    useEffect(() => {
        if(typeof window !== 'undefined')
        setWindowLoaded(true);
    }, []);

    useEffect(() => {
        if(duration && !playing && playerRef?.current && props.playedSeconds > 0) {
            if(duration > props.playedSeconds)
            playerRef.current.seekTo(props.playedSeconds);
        }
    }, [playerRef, props.playedSeconds, duration]);

    if(!windowLoaded)
    return <></>;

    const handleControlAction = (action) => {
        switch(action) {
            case 'play':
                setPlaying(true);
                break;
            case 'replay':
                playerRef.current.seekTo(0);
                break;
            case 'pause':
                setPlaying(false);
                break;
            case 'close':
                if(props.onClose)
                props.onClose();
                break;
            case 'seek:-20m':
                playerRef.current.seekTo(playerRef.current.getCurrentTime() - 1200);
                break;
            case 'seek:-5m':
                playerRef.current.seekTo(playerRef.current.getCurrentTime() - 300);
                break;
            case 'seek:-30s':
                playerRef.current.seekTo(playerRef.current.getCurrentTime() - 30);
                break;
            case 'seek:+30s':
                playerRef.current.seekTo(playerRef.current.getCurrentTime() + 30);
                break;
            case 'seek:+5m':
                playerRef.current.seekTo(playerRef.current.getCurrentTime() + 300);
                break;
            case 'seek:+20m':
                playerRef.current.seekTo(playerRef.current.getCurrentTime() + 1200);
                break;
        }
    };

    return (
        <div className={ styles.container } style={{ width: props.width, height: props.height }}>
            <PlayerControls
                playerProps={ { playing: playing, ...props } }
                onAction={ handleControlAction }    
                isStream={ isStream }
            />
            <ReactPlayer
                ref={ playerRef }
                url={ props.url }
                className={ styles.player }
                width={ props.width }
                height={ props.height }
                controls={ false }
                playing={ playing }
                config={{
                    file: {
                        forceHLS: isStream,
                        forceSafariHLS: isStream
                    }
                }}
                onProgress={ progress => {
                    if(!isStream && props.onProgress)
                    props.onProgress(progress);
                } }
                onSeek={ () => !playing && setPlaying(true) }
                onEnded={ () => {
                    if(props.onClose)
                    props.onClose();
                }}
                onDuration={ (duration) => setDuration(duration) }
            />
        </div>
    );
};

export default Player;