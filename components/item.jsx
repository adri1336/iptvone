import styles from "@/styles/item.module.css";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const Item = ({ item, onSelected, focusKey, onFocus, renderTheImage = true }) => {
    const { ref: viewRef, inView, entry } = useInView({});

    const [ lastPress, setLastPress ] = useState(0);
    const [ enterPressed, setEnterPressed ] = useState(false);
    const [ renderImage, setRenderImage ] = useState(null);
    const { ref, focused } = useFocusable({
        onEnterPress: () => {
            if(!enterPressed) {
                setLastPress(Date.now())
                setEnterPressed(true);
            }
        },
        
        onEnterRelease: () => {
            if(Date.now() - lastPress > 1000) onSelected(true);
            else onSelected();
            setEnterPressed(false);
        },
        onFocus: () => {
            if(onFocus)
            onFocus();
            
            if(ref?.current)
            ref.current.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
        },
        focusKey: focusKey,
    });
    
    const loadItemImage = () => {
        //const raw = item.raw;
        const image = item?.tvg?.logo; //IPTV.getRawValue(raw, "tvg-logo");
        if(image) {
            const img = new Image();
            img.src = image;
            img.onload = () => setRenderImage(image);
        }
    };

    useEffect(() => {
        if(renderTheImage) {
            if(inView && !renderImage) loadItemImage();
            else if(!inView && renderImage) setRenderImage(null);
        }
    }, [inView, renderTheImage]);

    useEffect(() => {
        if(renderTheImage && inView && renderImage)
        loadItemImage();
    }, [item, renderTheImage]);
    
    if(!renderImage) {
        return (<div ref={ viewRef }>
            <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() } onAuxClick={ () => onSelected(true) }>
                <span className="text-medium text-center">{ item.name }</span>
            </div>
        </div>);
    }
    else {
        return (<div ref={ viewRef }>
            <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() } onAuxClick={ () => onSelected(true) }>
                <img src={ renderImage } alt="logo" className={ styles.itemCoverLogo } loading="lazy"/>
                <div className={ styles.itemCoverTitle }>
                    <span className="text-small text-center">{ item.name }</span>
                </div>
            </div>
        </div>);
    }
};

export default Item;