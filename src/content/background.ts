import { hashPayload, IInterceptorPayload } from "../extension.utils";
import {
  getPrimaryOperation,
  parseGraphqlRequest,
} from "../helpers/graphqlHelpers";
import { IResponse } from "./types";

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    const extractedOperation = getPrimaryOperation(request.body);
    const graph = parseGraphqlRequest(request.body);
    if (extractedOperation) {
      const operationName = extractedOperation.operationName;
      const catchAllKey = `${request.origin}:${operationName}:*`;
      const catchSpecificKey = `${
        request.origin
      }:${operationName}:${hashPayload(graph?.[0].variables ?? {})}`;
      chrome.storage.local.get([catchAllKey, catchSpecificKey], (items) => {
        let rule: IInterceptorPayload | undefined;

        rule = items[catchSpecificKey] || items[catchAllKey];
        if (rule) {
          if (rule.response && rule.response.replace) {
            const mockResponse = rule.response.replace.payload;
            setTimeout(() => {
              sendResponse({
                mockResponse,
                operationName,
              });
            }, rule.response.replace.timeout ?? 0);
          } else {
            const response: IResponse = {
              operationName,
              mockRequest: rule.request,
              patchResponse: rule.response?.patchPayload,
            };
            sendResponse(response);
          }
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
