import styles from "@/styles/item.module.css";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const Item = ({ item, render = true, onSelected, focusKey, onFocus }) => {
    const { ref: viewRef, inView, entry } = useInView({});

    const [ renderImage, setRenderImage ] = useState(null);
    const { ref, focused } = useFocusable({
        onEnterPress: () => onSelected(),
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
        if(inView && !renderImage) loadItemImage();
        else if(!inView && renderImage) setRenderImage(null);
    }, [inView]);

    useEffect(() => {
        if(inView && renderImage)
        loadItemImage();
    }, [item]);
    
    if(!render) {
        return (<div ref={ viewRef }>
            <div ref={ ref } className={ styles.itemContainer }/>
        </div>);
    }
    else if(!renderImage) {
        return (<div ref={ viewRef }>
            <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
                <span className="text-medium text-center">{ item.name }</span>
            </div>
        </div>);
    }
    else {
        return (<div ref={ viewRef }>
            <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
                <img src={ renderImage } alt="logo" className={ styles.itemCoverLogo }/>
                <div className={ styles.itemCoverTitle }>
                    <span className="text-small text-center">{ item.name }</span>
                </div>
            </div>
        </div>);
    }
};

export default Item;