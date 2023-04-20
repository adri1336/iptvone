import { getWindowDimensions } from "@/utils/functions";
import { useEffect, useRef, useState } from "react";
import Item from "./item";

const ITEM_WIDTH    = 350;  // px
const ITEM_HEIGHT   = 300;  // px
const ITEM_MARGIN   = 10;   // px

const ItemList = ({ items, onSelected, onFocus, selectedGroupIndex }) => {
    const [ grid, setGrid ] = useState(null);
    const topRef = useRef(null);

    useEffect(() => {
        if(grid) {
            setGrid(null);
        }
    }, [items.length]);

    useEffect(() => {
        if(topRef && topRef?.current && typeof window !== "undefined" && items && items.length > 0 && grid === null) {
            window.scrollTo({ top: -100, behavior: 'instant' });
            let dimensions = getWindowDimensions(window);
            if(dimensions) {
                const top = topRef.current.getBoundingClientRect().top;
                const initialWidth = topRef.current.getBoundingClientRect().x + ITEM_MARGIN;
                dimensions.width -= initialWidth;
                dimensions.height -= top;

                let columns = Math.floor(dimensions.width / (ITEM_WIDTH + ITEM_MARGIN));
                let rows = Math.floor(items.length / columns);
                let visibleRows = Math.ceil(dimensions.height / (ITEM_HEIGHT + (ITEM_MARGIN * 3)));
                
                if(columns < 1) columns = 1;
                if(rows < 1) rows = 1;

                setGrid({
                    columns: columns,
                    rows: rows,
                    top: top,
                    width: dimensions.width,
                    height: dimensions.height,
                    items: items,
                    lastRenderedRow: visibleRows,
                    visibleRows: visibleRows,
                    offsetRows: 2
                });
            }
        }
        else if(grid !== null) {  
            if(grid.lastRenderedRow === grid.visibleRows)
            renderMoreItems();

            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [topRef, grid]);

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const lastVisibleRow = Math.floor((scrollY + grid.height) / (ITEM_HEIGHT + (ITEM_MARGIN * 3)));
        
        if(grid.lastRenderedRow - lastVisibleRow < 2)
        renderMoreItems();
    };

    const renderMoreItems = () => {
        const renderUpToRow = grid.lastRenderedRow + grid.offsetRows;
        let newItems = [], lastRenderedRow = null;
        grid.items.forEach((item, index) => {
            const row = Math.floor(index / grid.columns);
            const render = row <= renderUpToRow;
            if(render) lastRenderedRow = row;
            
            item.render = render;
            newItems.push(item);
        });
        setGrid({ ...grid, items: newItems, lastRenderedRow: lastRenderedRow });
    };

    if(grid === null)
    return <div ref={ topRef }/>;

    return <>
        {
            grid.items.filter(i => i.render === true).map((item, index) => {
                if(item?.isCollection)
                item.name = item?.tvName;
                
                return <Item
                    key={ `${ index }` }
                    item={ item }
                    render={ item.render === false || item.render === undefined ? false : true }
                    onSelected={ () => onSelected(item) }
                    focusKey={ `item_${ index }` }
                    onFocus={ () => onFocus(index) }
                />
            })
        }
    </>;
};

export default ItemList;