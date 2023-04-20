import styles from "@/styles/item.module.css";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const Item = ({ item, onSelected, focusKey, onFocus }) => {
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

    return <div>
        <div ref={ ref } className={ styles.itemContainer + " d-flex flex-column justify-content-center align-items-center" + (focused ? " " + styles.itemfocused : "") } onClick={ () => onSelected() }
            style={{
                backgroundImage: `url(${ item?.tvg?.logo })`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className={ styles.itemCoverTitle }>
                <span className="text-small text-center">{ item.name }</span>
            </div>
        </div>
    </div>;
};

export default Item;