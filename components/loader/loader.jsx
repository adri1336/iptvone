import { emitter } from './utils/emitter'

export const loader = (isLoading, options) => {
    if(isLoading) emitter.emit('SHOW', options);
    else emitter.emit('HIDE');
}