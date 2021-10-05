import { mockRequests } from "../mocks/mock-requests";

let removeListeners: Record<string, () => void> = {};

export const mockChrome = {
  storage: {
    local: {
      set: (payload, cb) => {
        const [key, value] = Object.entries(payload)[0];
        // console.log(key, value);
        localStorage.setItem(key, JSON.stringify(value));
        cb?.();
      },
      get: (keys: string[] | null, cb) => {
        if (keys === null) cb?.(localStorage);
        else {
          const obj = keys.reduce((out, key) => {
            const value = localStorage.getItem(key);
            if (value) out[key] = JSON.parse(value);
            return out;
          }, {} as Record<string, any>);
          cb?.(obj);
        }
      },
      remove: (id: string) => {
        localStorage.removeItem(id);
      },
    },
  },
  devtools: {
    panels: {
      themeName: "dark",
    },
    network: {
      getHAR: (cb) => {
        cb({ entries: mockRequests } as any);
      },
      onRequestFinished: {
        addListener: (cb) => {
          // On press key "1", add more mock requests to app
          const handleKeydown = (e: KeyboardEvent) => {
            if (e.code === "Digit1") {
              mockRequests.forEach((mockRequest) => {
                cb(mockRequest as any);
              });
            }
          };
          window.addEventListener("keydown", handleKeydown);
          removeListeners.onRequestFinished = () =>
            window.removeEventListener("keydown", handleKeydown);
        },
        removeListener: (cb) => {
          removeListeners.onRequestFinished();
        },
      },
      onNavigated: {
        addListener: (cb) => {},
        removeListener: (cb) => {},
      },
    },
  },
} as typeof chrome;
