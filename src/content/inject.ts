const _fetch = window.fetch;
// The ID of the extension we want to talk to.
var interceptorExtensionId = "fldngcpeogcbnnniebconffbcflpebck";

window.fetch = (...args) => {
  if (args.length > 1) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        interceptorExtensionId,
        { body: args[1]?.body },
        (response) => {
          if (response.mockResponse) {
            console.log(args);
            console.log(
              "mocking",
              response.operationName,
              response.mockResponse
            );
            resolve({
              text: () => Promise.resolve(response.mockResponse),
            } as any);
          } else {
            _fetch.apply(window, args).then((response) => resolve(response));
          }
        }
      );
    });
  }
  return _fetch.apply(window, args);
};

export {};
