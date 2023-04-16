import styles from "@/styles/item.module.css";
import IPTV from "@/utils/iptv";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useState } from "react";

const Item = ({ item, onSelected, focusKey, onFocus }) => {
    const [ hasImage, setHasImage ] = useState(false);
    const { ref, focused } = useFocusable({
        onEnterPress: () => onSelected(),
        onFocus: () => {
            if(onFocus)
            onFocus();
            
            if(ref?.current)
            ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        focusKey: focusKey,
    });

    const raw = item.raw;
    const image = IPTV.getRawValue(raw, "tvg-logo");
    if(image) {
        const img = new Image();
        img.src = image;
        img.onload = () => setHasImage(true);
    }
    
    if(!hasImage) {
        return <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
            <span className="text-medium text-center">{ item.name }</span>
        </div>
    }
    else {
        return <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
            <img src={ image } alt="logo" className={ styles.itemCoverLogo }/>
            <div className={ styles.itemCoverTitle }>
                <span className="text-small text-center">{ item.name }</span>
            </div>
        </div>
    }
};

export default Item;