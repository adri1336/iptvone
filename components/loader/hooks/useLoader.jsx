import { useReducer } from "react";

const initialState = {
  isLoading: false,
  message: null
};

const loaderReducer = (state, action, args) => {
  switch (action.type) {
    case 'SHOW': return { isLoading: true, options: action.options };
    case 'HIDE': return { isLoading: false };
    default: throw new Error();
  }
};

export const useLoader = () => {
  const [state, dispatch] = useReducer(loaderReducer, initialState)

  return { ...state, dispatch }
}
