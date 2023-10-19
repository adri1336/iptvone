import { createRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import styles from "@/styles/player.module.css";
import { FaPlay, FaPause, FaRedoAlt, FaSignInAlt } from "react-icons/fa";
import { GoMute, GoUnmute } from "react-icons/go";
import { MdFullscreenExit, MdFullscreen } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import { loader } from "@/components/loader/loader";
import { toast } from 'react-toastify';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const Control = ({ icon, text, onClick, setControls, focusKey }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => {
            setControls(control => control + 1);
            if(onClick)
            onClick();
        },
        onFocus: () => setControls(control => control + 1),
        focusKey: focusKey
    });

    return (
        <div ref={ ref } className={ (icon ? styles.controlWithIcon : styles.control) + " " +  (focused ? styles.controlfocused : "") + " d-flex flex-column justify-content-center align-items-center" } onClick={ () => onClick() }>
            { icon }
            <span className={ "text-medium fw-bold m-10" }>{ text }</span>
        </div>
    );
};

const PlayerControls = ({ playerProps, onAction, isStream, conversor, duration, progress }) => {
    const [ controls, setControls ] = useState(1);
    useEffect(() => {
        if(controls > 0) {
            const timer = window.setInterval(() => {
                setFocus('play-pause');
                setControls(0);
            }, 6000);

            return () => { 
                window.clearInterval(timer);
            }
        }
    }, [controls]);

    const { t } = useTranslation();
    const { ref, focusKey, focusSelf, setFocus } = useFocusable({
        onFocus: () => {
            setControls(control => control + 1);
        },
        onBlur: () => {
            setControls(0);
        },
        isFocusBoundary: true
    });

    useEffect(() => {
        setFocus('play-pause');
    }, [focusSelf]);

    let durationString = "";
    if(duration > 0)
    durationString = new Date(duration * 1000).toISOString().slice(11, 19);

    let progressString = "";
    if(progress && progress.playedSeconds > 0)
    progressString = new Date(progress.playedSeconds * 1000).toISOString().slice(11, 19);
    

    return (<FocusContext.Provider value={ focusKey }>
        { !controls && <div className={ styles.showControls } onMouseMove={ () => setControls(control => control + 1) }/> }
        { !controls && <div className={ styles.hideControls }/> }
        <div ref={ ref } className={ styles.controls + " d-flex flex-column justify-content-between" } style={{ width: playerProps.width, height: playerProps.height, zIndex: controls ? 100 : 0 }}>
            <div className="d-flex flex-column">
                <span className="text-medium fw-bold text-center">{ playerProps.channelName }</span>
                <span className="fw-bold text-center" style={{ fontSize: '10pt' }}>{ playerProps.url }</span>
                { !isStream && durationString.length > 0 && progressString.length > 0 && <span className="text-small fw-bold text-center">{ `${ progressString }/${ durationString }` }</span> }
                <div className="d-flex flew-row justify-content-center">
                {
                    !isStream &&
                    <div className="d-flex">
                        <Control
                            text={ '-20m' }
                            onClick={ () => onAction('seek:-20m') }
                            setControls={ setControls }
                            focusKey={ 'seek-20m' }
                        />
                        <Control
                            text={ '-5m' }
                            onClick={ () => onAction('seek:-5m') }
                            setControls={ setControls }
                            focusKey={ 'seek-5m' }
                        />
                        <Control
                            text={ '-30s' }
                            onClick={ () => onAction('seek:-30s') }
                            setControls={ setControls }
                            focusKey={ 'seek-30s' }
                        />
                        <Control
                            text={ '+30s' }
                            onClick={ () => onAction('seek:+30s') }
                            setControls={ setControls }
                            focusKey={ 'seek+30s' }
                        />
                        <Control
                            text={ '+5m' }
                            onClick={ () => onAction('seek:+5m') }
                            setControls={ setControls }
                            focusKey={ 'seek+5m' }
                        />
                        <Control
                            text={ '+20m' }
                            onClick={ () => onAction('seek:+20m') }
                            setControls={ setControls }
                            focusKey={ 'seek+20m' }
                        />
                    </div>
                }
                </div>
            </div>
            <div className="d-flex flex-row justify-content-between">
                <div className="d-flex">
                    {
                        playerProps.playing ?
                            <Control
                                icon={ <FaPause/> }
                                text={ t('COMPONENTS.PLAYER.PAUSE') }
                                onClick={ () => onAction('pause') }
                                setControls={ setControls }
                                focusKey={ 'play-pause' }
                            />
                        :
                            <Control
                                icon={ <FaPlay/> }
                                text={ t('COMPONENTS.PLAYER.PLAY') }
                                onClick={ () => onAction('play') }
                                setControls={ setControls }
                                focusKey={ 'play-pause' }
                            />
                    }
                    {
                        !isStream &&
                        <Control
                            icon={ <FaRedoAlt/> }
                            text={ t('COMPONENTS.PLAYER.REPLAY') }
                            onClick={ () => onAction('replay') }
                            setControls={ setControls }
                            focusKey={ 'replay' }
                        />
                    }
                </div>
                <div className="d-flex">
                    {
                        playerProps.muted ?
                            <Control
                                icon={ <GoMute/> }
                                text={ t('COMPONENTS.PLAYER.UNMUTE') }
                                onClick={ () => onAction('unmute') }
                                setControls={ setControls }
                                focusKey={ 'mute-unmute' }
                            />
                        :
                            <Control
                                icon={ <GoUnmute/> }
                                text={ t('COMPONENTS.PLAYER.MUTE') }
                                onClick={ () => onAction('mute') }
                                setControls={ setControls }
                                focusKey={ 'mute-unmute' }
                            />
                    }
                    {
                        playerProps.fullScreen ?
                            <Control
                                icon={ <MdFullscreenExit/> }
                                text={ t('COMPONENTS.PLAYER.EXIT_FULLSCREEN') }
                                onClick={ () => onAction('exit-fullscreen') }
                                setControls={ setControls }
                                focusKey={ 'fullscreen' }
                            />
                        :
                            <Control
                                icon={ <MdFullscreen/> }
                                text={ t('COMPONENTS.PLAYER.FULLSCREEN') }
                                onClick={ () => onAction('fullscreen') }
                                setControls={ setControls }
                                focusKey={ 'fullscreen' }
                            />
                    }
                    <Control
                        icon={ <FaSignInAlt/> }
                        text={ t('COMPONENTS.PLAYER.EXIT') }
                        onClick={ () => onAction('close') }
                        setControls={ setControls }
                        focusKey={ 'close' }
                    />
                </div>
            </div>
        </div>
    </FocusContext.Provider>);
};

const Player = (props) => {
    const API_URL = process.env.API_URL; //for converter
    const [ isStream, setIsStream ] = useState(props.url.includes('m3u'));
    const [ windowLoaded, setWindowLoaded ] = useState(false);
    const [ videoLoaded, setVideoLoaded ] = useState(false);
    const [ playing, setPlaying ] = useState(isStream);
    const [ muted, setMuted ] = useState(false);
    const [ progress, setProgress ] = useState(null);
    const [ duration, setDuration ] = useState(null);
    const [ conversor, setConversor ] = useState(false);
    const [ conversorSeekTo, setConversorSeekTo ] = useState(0);
    const playerRef = createRef();
    const handleFullscreen = useFullScreenHandle();

    const handleControlAction = (action) => {
        let newSeconds = 0;
        switch(action) {
            case 'play':
                setPlaying(true);
                return;
            case 'pause':
                setPlaying(false);
                return;
            case 'mute':
                setMuted(true);
                return;
            case 'unmute':
                setMuted(false);
                return;
            case 'fullscreen':
                handleFullscreen.enter();
                return;
            case 'exit-fullscreen':
                handleFullscreen.exit();
                return;
            case 'close':
                if(props.onClose) {
                    loader(false);
                    props.onClose();
                }
                return;
            case 'replay':
                newSeconds = 0;
                break;
            case 'seek:-20m':
                newSeconds = conversorSeekTo + playerRef.current.getCurrentTime() - 1200;
                if(newSeconds < 0) newSeconds = 0;
                break;
            case 'seek:-5m':
                newSeconds = conversorSeekTo + playerRef.current.getCurrentTime() - 300;
                if(newSeconds < 0) newSeconds = 0;
                break;
            case 'seek:-30s':
                newSeconds = conversorSeekTo + playerRef.current.getCurrentTime() - 30;
                if(newSeconds < 0) newSeconds = 0;
                break;
            case 'seek:+30s':
                newSeconds = conversorSeekTo + playerRef.current.getCurrentTime() + 30;
                if(newSeconds > duration) newSeconds = duration - 1;
                break;
            case 'seek:+5m':
                newSeconds = conversorSeekTo + playerRef.current.getCurrentTime() + 300;
                if(newSeconds > duration) newSeconds = duration - 1;
                break;
            case 'seek:+20m':
                newSeconds = conversorSeekTo + playerRef.current.getCurrentTime() + 1200;
                if(newSeconds > duration) newSeconds = duration - 1;
                break;
        }

        if(conversor) {
            loader(true, { opacity: 0.1 })
            setConversorSeekTo(newSeconds);
            setPlaying(true);
        }
        else playerRef.current.seekTo(newSeconds);
    };

    useEffect(() => {
        if(typeof window !== 'undefined') {
            (async () => {
                const browser = (function() {
                    var test = function(regexp) {return regexp.test(window.navigator.userAgent)}
                    switch (true) {
                        case test(/edg/i): return "Microsoft Edge";
                        case test(/trident/i): return "Microsoft Internet Explorer";
                        case test(/firefox|fxios/i): return "Mozilla Firefox";
                        case test(/opr\//i): return "Opera";
                        case test(/ucbrowser/i): return "UC Browser";
                        case test(/samsungbrowser/i): return "Samsung Browser";
                        case test(/chrome|chromium|crios/i): return "Google Chrome";
                        case test(/safari/i): return "Apple Safari";
                        default: return "Other";
                    }
                })();

                const userAgent = window.navigator.userAgent.toLowerCase();
                const isSafari = browser === 'Apple Safari';
                const isChrome = userAgent.indexOf('chrome') !== -1;

                try {
                    if(API_URL) {
                        const res = await fetch(props.url);
                        const contentType = res.headers.get('content-type');

                        if(!contentType.includes('video') && !isStream) setIsStream(true);
                        else if(contentType.includes('video')) {
                            if((!isChrome && !contentType.toLowerCase().includes('mp4')) || contentType.toLowerCase().includes('x-msvideo')) {
                                try {
                                    const metadataRes = await fetch(`${API_URL}/metadata?url=${ encodeURIComponent(props.url) }`);
                                    const metadata = await metadataRes.json();
                                    setDuration(metadata.format.duration);
                                    setConversor(true);
                                }
                                catch(e) { }
                            }
                        }
                    }
                }
                catch(e) { }
                finally {
                    if(isSafari) setMuted(true);
                    setWindowLoaded(true);
                    loader(true, { opacity: 0.1 });
                }
            })();
        }
    }, []);

    useEffect(() => {
        if(typeof window !== 'undefined') {
            const handleKeyDown = (e) => {
                const keyCode = e.keyCode || e.which;
                if(keyCode === 461 /* LG Back Button */ || keyCode === 10009 /* Samsung Back Button */ || keyCode === 27 /* Esc */) {
                    if(props.onClose) {
                        loader(false);
                        props.onClose();
                    }
                }
                else if(keyCode === 32 /* Space */) {
                    if(playing) handleControlAction('pause');
                    else handleControlAction('play');
                }
                else if(keyCode === 415 /* LG Play Button */) handleControlAction('play');
                else if(keyCode === 19 /* LG Pause Button */) handleControlAction('pause');
            };
            const handleMessage = (e) => { // for Android
                if(e && e?.data === 'goBack') {
                    if(props.onClose) {
                        loader(false);
                        props.onClose();
                    }
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("message", handleMessage);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
                window.removeEventListener("message", handleMessage);
            }
        }
    }, [playing]);

    useEffect(() => {
        if(progress === null && duration && !playing && playerRef?.current && props.playedSeconds > 0) {
            if(duration > props.playedSeconds) {
                if(!conversor) playerRef.current.seekTo(props.playedSeconds);
                else {
                    setConversorSeekTo(props.playedSeconds);
                    setPlaying(true);
                }
            }
        }
    }, [playerRef, props.playedSeconds, duration]);

    if(!windowLoaded)
    return <div className="d-flex align-items-center justify-content-center" style={{ backgroundColor: '#353535', width: '100vw', height: '100vh' }}/>;

    let videoUrl = conversor ? `${ API_URL }/convert?url=${ encodeURIComponent(props.url) }` : props.url;
    if(conversor && conversorSeekTo > 0)
    videoUrl += `&seekTo=${ conversorSeekTo }`;
    
    return (<FullScreen handle={ handleFullscreen }>
        <div className={ styles.container } style={{ width: props.width, height: props.height }}>
            <PlayerControls
                playerProps={ { playing: playing, muted: muted, fullScreen: handleFullscreen.active, ...props } }
                onAction={ handleControlAction }    
                isStream={ isStream }
                duration={ duration }
                progress={ progress }
                conversor={ conversor }
            />
            <ReactPlayer
                ref={ playerRef }
                url={ videoUrl }
                className={ styles.player }
                width={ props.width }
                height={ props.height }
                controls={ false }
                playing={ playing }
                playsinline={ true }
                muted={ muted }
                config={{
                    file: {
                        forceHLS: isStream,
                        forceSafariHLS: isStream
                    }
                }}
                onProgress={ progress => {
                    const realProgress = { ...progress, playedSeconds: conversorSeekTo + progress.playedSeconds }
                    setProgress(realProgress);
                    
                    if(props.onProgress)
                    props.onProgress(realProgress);
                } }
                onSeek={ () => !playing && setPlaying(true) }
                onEnded={ () => {
                    setPlaying(false);
                    if(props.onEnded) {
                        loader(false);
                        props.onEnded();
                    }
                }}
                onDuration={ (duration) => {
                    if(!props.playedSeconds && !playing)
                    setPlaying(true);

                    if(!conversor)
                    setDuration(duration);
                } }
                onBuffer={ () => loader(true, { opacity: 0.1 }) }
                onBufferEnd={
                    () => {
                        if(!videoLoaded) {
                            setVideoLoaded(true);
                            handleFullscreen.enter();
                        }
                        loader(false);
                    }
                }
                onError={
                    (error) => {
                        loader(false);
                        toast.error(error.message);
                    }
                }
            />
        </div>
    </FullScreen>);
};

export default Player;