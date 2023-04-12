const Input = (props) => {
    return <input ref={ props?.iref } { ...props } />;
};

export default Input;