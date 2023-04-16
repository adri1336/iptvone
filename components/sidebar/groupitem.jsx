import styles from "@/styles/groupitem.module.css";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const GroupItem = ({ name, selected, onSelected, focusKey, onFocus }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => onSelected(),
        onFocus: () => {
            if(onFocus)
            onFocus();

            if(ref?.current)
            ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        focusKey: focusKey
    });

    return <li ref={ ref } className={ styles.li + (selected ? " " + styles.liselected : "") + (focused ? " " + styles.lifocused : "")} onClick={ () => onSelected() }>{ name }</li>;
};

export default GroupItem;