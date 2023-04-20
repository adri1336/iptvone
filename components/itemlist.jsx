import { getWindowDimensions } from "@/utils/functions";
import { useEffect, useRef, useState } from "react";
import Item from "./item";

const ITEM_WIDTH    = 350;  // px
const ITEM_HEIGHT   = 300;  // px
const ITEM_MARGIN   = 10;   // px
const SIDEBAR_WIDTH = 400;  // px

const ItemList = ({ items, onSelected, onFocus }) => {
    const [ grid, setGrid ] = useState(null);
    const [ scrollPosition, setScrollPosition ] = useState(0);
    const topRef = useRef(null);

    useEffect(() => {
        if(topRef && topRef?.current && typeof window !== "undefined" && items && items.length > 0 && !grid) {
            let dimensions = getWindowDimensions(window);
            if(dimensions) {
                const top = topRef.current.getBoundingClientRect().top;
                dimensions.width -= SIDEBAR_WIDTH;
                dimensions.height -= top;
                let columns = Math.floor(dimensions.width / (ITEM_WIDTH + ITEM_MARGIN));
                let rows = Math.ceil(items.length / columns);
                
                if(columns < 1) columns = 1;
                if(rows < 1) rows = 1;

                setGrid({
                    columns: columns,
                    rows: rows,
                    top: top,
                    width: dimensions.width,
                    height: dimensions.height
                });

                //scroll
                const handleScroll = () => setScrollPosition(window.scrollY);
                window.addEventListener("scroll", handleScroll);
                return () => window.removeEventListener("scroll", handleScroll);
            }
        }
    }, [topRef]);

    if(!grid) return <div ref={ topRef }/>;
    return <>
        {
            items.map((item, index) => {
                //render only visible items
                let row = Math.floor(index / grid.columns);
                let top = grid.top + ITEM_MARGIN + (row * (ITEM_HEIGHT + (ITEM_MARGIN * 3)));
                const render = scrollPosition + grid.height > top && scrollPosition < top + ITEM_HEIGHT;
                if(!render) return <Item key={ index } focusKey={ `item_${ index }` } render={ false }/>;

                if(item?.isCollection)
                item.name = item?.tvName;

                return <Item
                    key={ index }
                    item={ item }
                    onSelected={ () => onSelected(item) }
                    focusKey={ `item_${ index }` }
                    onFocus={ () => onFocus(index) }
                />
            })
        }
    </>;
};

export default ItemList;