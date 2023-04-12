import { emitter } from './emitter';

export const loaderDispatcher = ({ dispatch }) => {
  emitter.on('SHOW', (options) => dispatch({ type: 'SHOW', options: options }));
  emitter.on('HIDE', () => dispatch({ type: 'HIDE' }));
}
