import { getPrimaryOperation } from "../helpers/graphqlHelpers";

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    const extractedOperation = getPrimaryOperation(request.body);
    if (extractedOperation) {
      const operationName = extractedOperation.operationName;
      chrome.storage.local.get([operationName], (items) => {
        if (items[operationName]) {
          sendResponse({
            mockResponse: items[operationName],
            operationName,
          });
        } else {
          sendResponse({ mockResponse: false });
        }
      });
    } else {
      sendResponse({ mockResponse: false });
    }
  }
);

export {};
