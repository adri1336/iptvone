import styles from "@/styles/item.module.css";
import IPTV from "@/utils/iptv";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const Item = ({ item, onSelected }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => onSelected()
    });

    const raw = item.raw;

    return <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-between align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }>
        <img src={ IPTV.getRawValue(raw, "tvg-logo") } alt="logo" className={ styles.itemLogo }/>
        <span className="text-small text-center">{ item.name }</span>
    </div>
};

export default Item;