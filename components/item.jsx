import styles from "@/styles/item.module.css";
import IPTV from "@/utils/iptv";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useState } from "react";

const Item = ({ item, onSelected }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => onSelected(),
        onFocus: () => ref?.current && ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
    });

    const raw = item.raw;
    const image = IPTV.getRawValue(raw, "tvg-logo");
    
    const [ aspectRatio, setAspectRatio ] = useState(1);
    const img = new Image();
    img.src = image;
    img.onload = () => {
        setAspectRatio(img.width / img.height);
    };
    img.onerror = () => {
        setAspectRatio(0);
    };
    
    const isCover = aspectRatio < 0.7;
    
    if(aspectRatio === 0) {
        return <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
            <span className="text-medium text-center">{ item.name }</span>
        </div>
    }
    else if(isCover) {
        return <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
            <img src={ image } alt="logo" className={ styles.itemCoverLogo }/>
            <div className={ styles.itemCoverTitle }>
                <span className="text-small text-center">{ item.name }</span>
            </div>
        </div>
    }
    else 
        return <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
            <img src={ image } alt="logo" className={ styles.itemLogo }/>
            <span className="text-medium text-center">{ item.name }</span>
        </div>
};

export default Item;