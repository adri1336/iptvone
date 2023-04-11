import '@/styles/globals.css'
import { init } from '@noriginmedia/norigin-spatial-navigation';

init({
  debug: false,
  visualDebug: false
});

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
