import styles from "@/styles/groupitem.module.css";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const GroupItem = ({ name, selected, onSelected }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => onSelected(),
        onFocus: () => ref?.current && ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
    });

    return <li ref={ ref } className={ styles.li + (selected ? " " + styles.liselected : "") + (focused ? " " + styles.lifocused : "")} onClick={ () => onSelected() }>{ name }</li>;
};

export default GroupItem;