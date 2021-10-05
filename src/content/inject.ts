import { IResponse } from "./types";
import mergeWith from "lodash/mergeWith";

const _fetch = window.fetch;
// The ID of the extension we want to talk to.
var interceptorExtensionId = "fldngcpeogcbnnniebconffbcflpebck";

window.fetch = (...args) => {
  if (args.length > 1) {
    let headers: any = { ...args[1]?.headers };
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        interceptorExtensionId,
        { body: args[1]?.body, origin: window.location.origin },
        (messageResponse: IResponse) => {
          if (messageResponse.mockResponse) {
            console.log(
              "mocking",
              messageResponse.operationName,
              "to be",
              JSON.parse(messageResponse.mockResponse)
            );
            resolve({
              text: () => Promise.resolve(messageResponse.mockResponse),
            } as any);
            // Make the call so that it shows up on network tab
            _fetch.apply(window, args);
          } else {
            try {
              let body = args[1]?.body;
              const parsedBody = JSON.parse(body?.toString() ?? "{}");
              if (messageResponse.mockRequest) {
                if (messageResponse.mockRequest.appendHeaders) {
                  console.log(
                    "Appended headers",
                    messageResponse.mockRequest.appendHeaders,
                    "to",
                    messageResponse.operationName
                  );
                  headers = {
                    ...headers,
                    ...messageResponse.mockRequest.appendHeaders,
                  };
                }

                if (messageResponse.mockRequest.payload) {
                  parsedBody.variables = JSON.parse(
                    messageResponse.mockRequest.payload
                  );
                  console.log(
                    "Mocking variables for ",
                    messageResponse.operationName,
                    "to",
                    messageResponse.mockRequest.payload
                  );
                }
              }

              if (args[1]) {
                args[1].headers = headers;
                args[1].body = JSON.stringify(parsedBody);
              }
              _fetch.apply(window, args).then(async (apiresponse) => {
                if (messageResponse.patchResponse) {
                  const parsedApiResponse = JSON.parse(
                    await apiresponse.text()
                  );
                  console.log(
                    "Patching response",
                    messageResponse.patchResponse,
                    "to the server response of",
                    messageResponse.operationName
                  );
                  resolve({
                    text: () =>
                      Promise.resolve(
                        JSON.stringify(
                          mergeWith(
                            parsedApiResponse,
                            messageResponse.patchResponse,
                            (out, src) => {
                              if (Array.isArray(src)) {
                                return [...out, ...src];
                              }
                            }
                          )
                        )
                      ),
                  } as any);
                } else {
                  resolve(apiresponse);
                }
              });
            } catch (e) {
              _fetch.apply(window, args).then((response) => resolve(response));
            }
          }
        }
      );
    });
  }
  return _fetch.apply(window, args);
};

export {};
