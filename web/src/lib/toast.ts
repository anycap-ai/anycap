type ToastVariant = "info" | "error";
type ToastMessage = { text: string; variant: ToastVariant; id: number };
type Listener = (msg: ToastMessage) => void;

let nextId = 0;
const listeners = new Set<Listener>();

function emit(text: string, variant: ToastVariant) {
  const msg: ToastMessage = { text, variant, id: ++nextId };
  listeners.forEach((fn) => fn(msg));
}

export const toast = {
  error(text: string) { emit(text, "error"); },
  info(text: string) { emit(text, "info"); },
};

export function onToast(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export type { ToastMessage, ToastVariant };
