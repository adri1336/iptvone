import {
  init,
  useFocusable,
  FocusContext
} from "@noriginmedia/norigin-spatial-navigation";
import { useEffect } from "react";

export function Header({ name1 }) {
  const { ref, focused } = useFocusable({});
  return (
    <div ref={ref} className={focused ? "button-focused" : "button"}>
      Press Me
    </div>
  );
}


export default () => {
  init({});
  const { ref, focusKey, setFocus, focusSelf } = useFocusable({
    isFocusBoundary: true
  });
  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  return (
    <div className="parentClass">
      <FocusContext.Provider value={focusKey}>
        <div className="parentClass" ref={ref}>
          <Header name1="One" />
          <Header name1="Two" />
          <Header name1="Three" />
          <Header name1="Four" />
          <Header name1="Five" />
          {/* <Footer name1="Six" /> */}
        </div>
      </FocusContext.Provider>
    </div>
  );
}
