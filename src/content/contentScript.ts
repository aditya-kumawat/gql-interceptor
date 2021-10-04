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

export {};
