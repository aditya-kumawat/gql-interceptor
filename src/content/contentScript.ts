import { IInterceptorPayload } from "@/extension.utils";

console.log("Starting!");

const injectScripts = (callback: () => void) => {
  let interceptorScript = document.createElement("script");
  interceptorScript.async = false;
  interceptorScript.defer = false;
  interceptorScript.src = chrome.runtime.getURL("./content/inject.js");
  interceptorScript.type = "text/javascript";
  interceptorScript.id = "interceptor";
  interceptorScript.onload = callback;
  if (!document.getElementById("interceptor")) {
    (document.head || document.documentElement).appendChild(interceptorScript);
  } else {
    callback();
  }
};

injectScripts(() => {
  console.log("Scripts injected");
});
/**
const bar: IInterceptorPayload = {
  request: {
    appendHeaders: {
      mySpecificHeader: "mySpecificValue",
    },
  },
  response: {
    patchPayload: {
      data: {
        globalSla: {
          name: "My Mocked Name",
        },
      },
    },
  },
};
chrome.storage.local.set(
  { [`${window.location.origin}:SLADetailsQuery:*`]: bar },
  () => {
    console.log("Saved the settings for", window.location.origin);
  }
);
 */
export {};
