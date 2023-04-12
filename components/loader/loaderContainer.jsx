import { Oval } from "react-loader-spinner";
import styles from "@/styles/loader.module.css";
import { useEffect } from 'react';
import { useLoader } from "./hooks/useLoader";
import { emitter } from './utils/emitter';
import { loaderDispatcher } from './utils/loaderDispatcher';
import ENV from "@/utils/env";

const Loader = () => {
  const { isLoading, options, dispatch } = useLoader();

  useEffect(() => {
    loaderDispatcher({ dispatch });

    return () => {
      emitter.off()
    }
  }, [dispatch]);
  
  if(!isLoading)
  return <></>;
  else document.activeElement.blur();

  return (
      <div className={ styles.loaderContainer } style={{ backgroundColor: 'rgba(53, 53, 53, ' + (options?.opacity || 0.6) + ')' }}>
        { <span className={ styles.logo + " title-small fw-bold" }>{ ENV.APP_NAME }</span> }
        <div className={ styles.loader }>
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ width: '700px', height: '200px' }}>
            <Oval width={ 80 } height={ 80 } color='#c4c4c4' secondaryColor='#454545'/>
            { options?.message && <span className={ styles.loaderMessage }>{ options.message }</span> }
          </div>
        </div>
      </div>
  );
};

export default Loader;