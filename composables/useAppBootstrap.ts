type BootstrapStatus = "idle" | "pending" | "ready" | "error";

let bootstrapPromise: Promise<void> | null = null;

export const useAppBootstrap = () => {
  const status = useState<BootstrapStatus>("app-bootstrap-status", () => "idle");
  const error = useState<string | null>("app-bootstrap-error", () => null);
  const songStore = useSongStore();
  const sheetStore = useSheetStore();

  const pending = computed(() => status.value === "pending");

  const reset = () => {
    bootstrapPromise = null;
    status.value = "idle";
    error.value = null;
  };

  const bootstrap = async ({ force = false }: { force?: boolean } = {}) => {
    if (!isAuthenticated()) {
      reset();
      return;
    }

    if (!force) {
      if (status.value === "ready") {
        return;
      }

      if (bootstrapPromise) {
        return bootstrapPromise;
      }
    }

    status.value = "pending";
    error.value = null;

    const request = Promise.all([
      songStore.getSongs(),
      sheetStore.getSheets(),
    ])
      .then(() => {
        if (bootstrapPromise === request) {
          status.value = "ready";
        }
      })
      .catch((bootstrapError: unknown) => {
        if (bootstrapPromise === request) {
          status.value = "error";
          error.value = bootstrapError instanceof Error ? bootstrapError.message : "Unable to load app data";
        }
        throw bootstrapError;
      })
      .finally(() => {
        if (bootstrapPromise === request) {
          bootstrapPromise = null;
        }
      });

    bootstrapPromise = request;

    return request;
  };

  return {
    bootstrap,
    error,
    pending,
    reset,
    status,
  };
};
