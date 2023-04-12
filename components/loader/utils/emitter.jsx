export const emitter = (() => {
  const events = new Map();

  return {
    on(event, callback) {
      if (!events.has(event)) events.set(event, [])
      events.get(event).push(callback)
    },
    emit(event, args) {
      if (!events.has(event)) return;
      events.get(event).forEach((callback) => callback(args));
    },
    off() {
      events.clear();
    }
  }
})
();
