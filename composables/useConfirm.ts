export interface ConfirmOptions {
  header?: string
  message?: string
  icon?: string
  acceptLabel?: string
  rejectLabel?: string
  accept?: () => void
  reject?: () => void
}

const current = ref<ConfirmOptions | null>(null);

export const useConfirm = () => {
  const require = (options: ConfirmOptions): void => {
    current.value = options;
  };

  const accept = (): void => {
    current.value?.accept?.();
    current.value = null;
  };

  const reject = (): void => {
    current.value?.reject?.();
    current.value = null;
  };

  return { require, accept, reject, current };
};
