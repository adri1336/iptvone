import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useRef } from "react";

const Button = (props) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => {
            if(buttonRef?.current)
            buttonRef.current.click();
        },
        onFocus: () => {
            if(props?.onFocus)
            props.onFocus();
            
            if(ref?.current)
            ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
        },
        focusKey: props?.focusKey,
    });

    const buttonRef = useRef();

    return (
        <div ref={ ref }>
            <button ref={ buttonRef } { ...props } className={ props?.className + " " + (focused ? "dark-button-focused" : "") }/>
        </div>
    );
};

export default Button;