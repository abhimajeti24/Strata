/**
 * Tiny pubsub that lets the preloader hand off to the hero intro timeline
 * without lifting state through the tree. `signalReveal` is idempotent;
 * late subscribers fire immediately.
 */
let revealed = false;
const listeners = new Set<() => void>();

export function signalReveal() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function onReveal(fn: () => void): () => void {
  if (revealed) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}
