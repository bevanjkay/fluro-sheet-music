import type { Component } from "vue";

export interface DialogInstance {
  component: Component
  props: Record<string, unknown>
}

const current = shallowRef<DialogInstance | null>(null);

export const useDialog = () => {
  const open = (component: Component, props: Record<string, unknown> = {}): void => {
    current.value = { component, props };
  };

  const close = (): void => {
    current.value = null;
  };

  return { open, close, current };
};
