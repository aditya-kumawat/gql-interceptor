import { hashPayload, IInterceptorPayload } from "@/extension.utils";
import { chromeProvider } from "./chromeProvider";

const chrome = chromeProvider();

const copyOfChromeStorage: { foo: Record<string, IInterceptorPayload> } = {
  foo: {},
};
export const refershLocalCopyOfChromeStorage = () => {
  chrome.storage.local.get(null, (items) => (copyOfChromeStorage.foo = items));
};
chrome.storage.local.get(null, (items) => {
  copyOfChromeStorage.foo = items;
});

export interface IMatchingRule {
  type: "all" | "specific";
  rule: IInterceptorPayload;
}
export const getInterceptionRule = (
  operationName: string,
  origin: string,
  variables?: object
): IMatchingRule | undefined => {
  console.log("The local copy now is", copyOfChromeStorage.foo);
  const hash = variables ? hashPayload(variables) : "-";
  const catchAllKey = `${origin}:${operationName}:*`;
  const catchSpecificKey = `${origin}:${operationName}:${hash}`;
  if (copyOfChromeStorage.foo[catchSpecificKey]) {
    return {
      type: "specific",
      rule: copyOfChromeStorage.foo[catchSpecificKey],
    };
  }
  if (copyOfChromeStorage.foo[catchAllKey]) {
    return {
      type: "all",
      rule: copyOfChromeStorage.foo[catchAllKey],
    };
  }
  return undefined;
};
