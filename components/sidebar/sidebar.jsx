import styles from "@/styles/sidebar.module.css";
import ENV from "@/utils/env";
import IPTV from "@/utils/iptv";
import GroupItem from "./groupitem";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";

const Sidebar = ({ onGroupSelected }) => {
    const [ lastFocused, setLastFocused ] = useState('group_start');
    const [ selectedGroupIndex, setSelectedGroupIndex ] = useState(-1);
    const { t } = useTranslation('common');
    const { ref, focusKey, focusSelf, setFocus, getCurrentFocusKey } = useFocusable({
        onFocus: () => {
            if(getCurrentFocusKey() !== lastFocused) {
                setFocus(lastFocused);
            }
        }
    });

    useEffect(() => {
        setFocus('group_start');
    }, [focusSelf]);


    return (<FocusContext.Provider value={ focusKey }>
        <div ref={ ref } className={ styles.sidebarContainer }>
            <div className="d-flex flex-column h-100">
                <div className="d-flex flex-column">
                    <span className="title-small fw-bold">{ ENV.APP_NAME }</span>
                    <span className="text-small">{ ENV.APP_VERSION }</span>
                </div>
                <div className="d-flex flex-column" style={{ marginTop: 60, marginBottom: 60 }}>
                    <GroupItem
                        name={ t('COMPONENTS.SIDEBAR.START').toUpperCase() }
                        selected={ selectedGroupIndex === -1 ? true : false }
                        onSelected={ () => {
                            setSelectedGroupIndex(-1);
                            if(onGroupSelected)
                            onGroupSelected(-1);
                        }}
                        focusKey={ 'group_start' }
                        onFocus={ () => setLastFocused('group_start') }
                    />
                </div>
                <div className="d-flex flex-column">
                    <ul className="d-flex flex-column" style={{ marginBottom: 60 }}>
                        {
                            IPTV.getGroups().map((group, index) => {
                                return <GroupItem
                                    key={ index }
                                    name={ group }
                                    selected={ selectedGroupIndex === index ? true : false }
                                    onSelected={ () => {
                                        setSelectedGroupIndex(index);
                                        if(onGroupSelected)
                                        onGroupSelected(index);
                                    }}
                                    focusKey={ 'group_' + index }
                                    onFocus={ () => setLastFocused('group_' + index) }
                                />
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    </FocusContext.Provider>);
};

export default Sidebar;