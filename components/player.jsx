import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import styles from "@/styles/player.module.css";
import { FaPlay, FaPause } from "react-icons/fa";
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

const PlayerControls = ({ playerProps, onAction }) => {
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
    const [ windowLoaded, setWindowLoaded ] = useState(false);
    const [ playing, setPlaying ] = useState(true);

    useEffect(() => {
        if(typeof window !== 'undefined')
        setWindowLoaded(true);
    }, []);

    if(!windowLoaded)
    return <></>;

    const handleControlAction = (action) => {
        switch(action) {
            case 'play':
                setPlaying(true);
                break;
            case 'pause':
                setPlaying(false);
                break;
            case 'close':
                if(props.onClose)
                props.onClose();
                break;
        }
    };

    const isStream = props.url.includes('m3u');
    return (
        <div className={ styles.container } style={{ width: props.width, height: props.height }}>
            <PlayerControls
                playerProps={ { playing: playing, ...props } }
                onAction={ handleControlAction }    
            />
            <ReactPlayer
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
            />
        </div>
    );
};

export default Player;