export type ToastSeverity = "success" | "info" | "warn" | "error";

export interface ToastMessage {
  id: number
  severity: ToastSeverity
  summary?: string
  detail?: string
  life?: number
}

// Module-level so every useToast() caller shares one queue; safe here because
// the app is client-only (ssr: false), so there is no cross-request state.
const messages = ref<ToastMessage[]>([]);
let nextId = 0;

const remove = (id: number): void => {
  messages.value = messages.value.filter(message => message.id !== id);
};

export const useToast = () => {
  const add = (message: Omit<ToastMessage, "id">): void => {
    const id = ++nextId;
    messages.value = [...messages.value, { ...message, id }];

    const life = message.life ?? 3000;
    if (life > 0) {
      setTimeout(() => remove(id), life);
    }
  };

  return { add, remove, messages };
};
