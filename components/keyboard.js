import { useTranslation } from 'next-i18next';
import styles from "@/styles/keyboard.module.css";
import { useState, useEffect } from 'react';
import {
    useFocusable,
    FocusContext
} from "@noriginmedia/norigin-spatial-navigation";
import { FaBackspace } from "react-icons/fa";

const Key = ({ keyId, keyText, onKeyPressed }) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => onKeyPressed()
    });

    if(keyId === 'backspace') {
        return (
            <div ref={ ref } className={ styles.key + " " + (focused ? styles.focusedkey : "") } onClick={ () => onKeyPressed() }>
                <FaBackspace fill={ focused ? '#1e1e1e' : 'whitesmoke' }/>
            </div>
        )
    }

    return (
        <div ref={ ref } className={ styles.key + " " + (focused ? styles.focusedkey : "") } onClick={ () => onKeyPressed() }>
            { keyText }
        </div>
    )
};

const Keyboard = ({ type = 'normal', onKeyPressed }) => {
    const { ref, focusKey, focusSelf } = useFocusable({ isFocusBoundary: true });
    
    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    const [ uppercase, setUppercase ] = useState(false);
    const [ specialCharacters, setSpecialCharacters ] = useState(false);
    const { t } = useTranslation('common');

    const normalKeys = [
        ["a", "b", "c", "d", "e", "f"],
        ["g", "h", "i", "j", "k", "l"],
        ["m", "n", "o", "p", "q", "r"],
        ["s", "t", "u", "v", "w", "x"],
        ["y", "z", "0", "1", "2", "3"],
        ["4", "5", "6", "7", "8", "9"]
    ];

    const specialCharactersKeys = [
        ["!", "@", "#", "$", "%", "^"],
        ["&", "*", "(", ")", "-", "_"],
        ["+", "=", "{", "}", "[", "]"],
        ["|", "\\", ":", ";", "'", "\""],
        [",", ".", "<", ">", "/", "?"],
        ["`", "~", "¿", "ñ", "ç", "º"]
    ];

    useEffect(() => {
        switch (type) {
            case 'url':
                normalKeys.unshift(["http://", "https://", ".com"]);
                break;
            case 'email':
                normalKeys.unshift(["@", "@gmail.com", ".com"]);
                break;
        }
    }, [type]);

    const [ keys, setKeys ] = useState(normalKeys);
    
    useEffect(() => {
        if (specialCharacters) {
            setKeys(specialCharactersKeys);
        } else {
            setKeys(normalKeys);
        }
    }, [specialCharacters]);

    return (<FocusContext.Provider value={ focusKey }>
        <div ref={ ref } className={ styles.keyboard }>
            <div className={ styles.keyboardrow + " justify-content-center" }>
                <Key keyText='abc' onKeyPressed={ () => setUppercase(false) }/>
                <Key keyText='ABC' onKeyPressed={ () => setUppercase(true) }/>
                {
                    specialCharacters ?
                        <Key keyText='ABC' onKeyPressed={ () => setSpecialCharacters(false) }/> :
                        <Key keyText='#+-' onKeyPressed={ () => setSpecialCharacters(true) }/>
                }
            </div>
            {
                keys.map((row, rowIndex) => 
                    <div key={ rowIndex } className={ styles.keyboardrow }>
                        {
                            row.map((key, keyIndex) => {
                                const keyText = uppercase ? key.toUpperCase() : key;
                                return <Key key={ keyIndex } keyText={ keyText } onKeyPressed={ () => onKeyPressed('character', keyText) }/>;
                            })
                        }
                    </div>
                )
            }
            <div className={ styles.keyboardrow + " justify-content-center" }>
                <Key keyText={ t('COMPONENTS.KEYBOARD.SPACE') } onKeyPressed={ () => onKeyPressed('space') }/>
                <Key keyId={ 'backspace' } keyText={ t('COMPONENTS.KEYBOARD.BACKSPACE') } onKeyPressed={ () => onKeyPressed('backspace') }/>
                <Key keyText={ t('COMPONENTS.KEYBOARD.CLEAR') } onKeyPressed={ () => onKeyPressed('clear') }/>
            </div>
        </div>
        </FocusContext.Provider>);
}

export default Keyboard;