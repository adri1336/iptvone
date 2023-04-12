import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useRef } from "react";

const Button = (props) => {
    const { ref, focused } = useFocusable({
        onEnterPress: () => {
            if(buttonRef?.current)
            buttonRef.current.click();
        }
    });

    const buttonRef = useRef();

    return (
        <div ref={ ref }>
            <button ref={ buttonRef } { ...props } className={ props?.className + " " + (focused ? "dark-button-focused" : "") }/>
        </div>
    );
};

export default Button;