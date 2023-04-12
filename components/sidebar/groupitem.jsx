import styles from "@/styles/groupitem.module.css";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const GroupItem = ({ name, selected, onSelected }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => onSelected()
    });

    return <li ref={ ref } className={ styles.li + " text-medium" + (selected ? " " + styles.liselected : "") + (focused ? " " + styles.lifocused : "")} onClick={ () => onSelected() }>{ name }</li>;
};

export default GroupItem;