import { hashPayload, IInterceptorPayload } from "@/extension.utils";
import { IGraphqlRequestBody } from "@/helpers/graphqlHelpers";
import { chromeProvider } from "@/services/chromeProvider";
import React, { useState } from "react";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";
import ace from "brace";
import { Checkbox } from "@/components/Checkbox";
import {
  IMatchingRule,
  refershLocalCopyOfChromeStorage,
} from "@/services/interceptionRules";

type NetworkMockProps = {
  data: NetworkRequest;
  response?: string;
  requests: IGraphqlRequestBody[];
  origin: string;
  matchingRule?: IMatchingRule;
  closeMock: () => void;
};

const chrome = chromeProvider();
export const NetworkMock = (props: NetworkMockProps) => {
  const { data, requests, response, origin, matchingRule, closeMock } = props;
  const [responsePayload, setResponsePayload] = useState(
    (matchingRule?.rule.response?.patchPayload
      ? JSON.stringify(matchingRule?.rule.response?.patchPayload)
      : undefined) ||
      (matchingRule?.rule.response?.replace?.payload
        ? matchingRule?.rule.response?.replace?.payload
        : undefined) ||
      response ||
      "{}"
  );
  const [variablesPayload, setVariablesPayload] = useState(
    matchingRule?.rule.request?.payload
      ? JSON.parse(matchingRule?.rule.request?.payload)
      : requests[0].variables ?? {}
  );
  const [interceptType, setInterceptType] = useState<string>(
    matchingRule?.type || "all"
  );
  const onChangeInterceptRadio = (event: React.ChangeEvent<HTMLInputElement>) =>
    setInterceptType(event.target.value);
  const [responseMod, setResponseMod] = useState(
    Boolean(matchingRule?.rule.response?.patchPayload)
      ? "patch"
      : Boolean(matchingRule?.rule.response?.replace)
      ? "replace"
      : "doNotModify"
  );
  const onChangeResponseModRadio = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setResponseMod(event.target.value);
  const [modifyVariable, setModifyVariables] = useState(false);
  const [modifyHeaders, setModifyHeaders] = useState(false);
  const [headersPayload, setHeadersPayload] = useState(
    matchingRule?.rule.request?.appendHeaders || {}
  );

  const hash = requests[0].variables ? hashPayload(requests[0].variables) : "*";

  const operationName = data.request.primaryOperation.operationName;

  return (
    <div className="flex flex-col h-full border-l border-gray-300 dark:border-gray-600 scroll overflow-y-scroll">
      <div className="flex items-center p-2" style={{ height: "3.5rem" }}>
        <div>
          <h2 className="font-bold">Intercept {operationName}</h2>
        </div>
      </div>
      <div className="pl-6">
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio"
            name="interceptAll"
            checked={interceptType === "all"}
            value="all"
            onChange={onChangeInterceptRadio}
          />
          <span className="ml-2">All requests</span>
        </label>
        <label className="inline-flex items-center ml-6">
          <input
            type="radio"
            className="form-radio"
            name="interceptAll"
            checked={interceptType === "specific"}
            value="specific"
            onChange={onChangeInterceptRadio}
          />
          <span className="ml-2">Only requests with same variables</span>
        </label>
      </div>
      <div className="flex items-center p-2" style={{ height: "3.5rem" }}>
        <div>
          <h2 className="font-bold">Request Modifications</h2>
        </div>
      </div>
      <div className="pt-2 pl-6">
        <Checkbox
          label="Append Headers"
          checked={modifyHeaders}
          onChange={() => {
            setModifyHeaders(!modifyHeaders);
          }}
        />
        {modifyHeaders && (
          <div className="pt-2 pl-12">
            <Editor
              value={headersPayload}
              onChange={setHeadersPayload}
              navigationBar={false}
              statusBar={false}
              search={true}
              mode="code"
              ace={ace}
            />
          </div>
        )}
      </div>
      <div className="pt-2 pl-6">
        <Checkbox
          label="Modify Variables"
          checked={modifyVariable}
          onChange={() => {
            setModifyVariables(!modifyVariable);
          }}
        />
        {modifyVariable && (
          <div className="pt-2 pl-12">
            <Editor
              value={variablesPayload}
              onChange={setVariablesPayload}
              navigationBar={false}
              statusBar={false}
              search={true}
              mode="code"
              ace={ace}
            />
          </div>
        )}
      </div>
      <div className="flex items-center p-2 mt-4" style={{ height: "3.5rem" }}>
        <div>
          <h2 className="font-bold">Response Modifications</h2>
        </div>
      </div>
      <div className="pl-6">
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio"
            name="responseModificationType"
            checked={responseMod === "replace"}
            value="replace"
            onChange={onChangeResponseModRadio}
          />
          <span className="ml-2">Replace</span>
        </label>
        <label className="inline-flex items-center ml-6">
          <input
            type="radio"
            className="form-radio"
            name="responseModificationType"
            checked={responseMod === "patch"}
            value="patch"
            onChange={onChangeResponseModRadio}
          />
          <span className="ml-2">Patch</span>
        </label>
        <label className="inline-flex items-center ml-6">
          <input
            type="radio"
            className="form-radio"
            name="responseModificationType"
            value="doNotModify"
            checked={responseMod === "doNotModify"}
            onChange={onChangeResponseModRadio}
          />
          <span className="ml-2">Do not modify</span>
        </label>
      </div>
      {(responseMod === "patch" || responseMod === "replace") && (
        <div className="pt-2 pl-16">
          <Editor
            value={JSON.parse(responsePayload)}
            onChange={(json: object) =>
              setResponsePayload(JSON.stringify(json))
            }
            navigationBar={false}
            statusBar={false}
            search={true}
            mode="code"
            ace={ace}
          />
        </div>
      )}
      <div className="flex items-center justify-center mt-12 mb-12">
        <button
          className="bg-blue-500 dark:bg-blue-600 rounded-lg px-3 py-1.5 font-bold opacity-80 hover:opacity-100 transition-opacity disabled:opacity-40"
          onClick={() => {
            const interceptorPayload: IInterceptorPayload = {};
            if (modifyHeaders || modifyVariable) {
              interceptorPayload.request = {};
              if (modifyHeaders) {
                interceptorPayload.request.appendHeaders = headersPayload;
              }
              if (modifyVariable) {
                interceptorPayload.request.payload =
                  JSON.stringify(variablesPayload);
              }
            }

            if (responseMod === "replace") {
              interceptorPayload.response = {
                replace: {
                  payload: responsePayload,
                },
              };
            }
            if (responseMod === "patch") {
              interceptorPayload.response = {
                patchPayload: JSON.parse(responsePayload),
              };
            }
            const key = interceptType === "all" ? "*" : hash;
            chrome.storage.local.set(
              { [`${origin}:${operationName}:${key}`]: interceptorPayload },
              () => {
                console.log("Saved the settings", {
                  [`${origin}:${operationName}:${key}`]: interceptorPayload,
                });
                refershLocalCopyOfChromeStorage();
                closeMock();
              }
            );
          }}
        >
          Save
        </button>
        {matchingRule && (
          <button
            className="ml-4 bg-red-500 dark:bg-red-600 rounded-lg px-3 py-1.5 font-bold opacity-80 hover:opacity-100 transition-opacity disabled:opacity-40"
            onClick={() => {
              const key = matchingRule.type === "all" ? "*" : hash;
              chrome.storage.local.remove(
                `${origin}:${operationName}:${key}`,
                () => {
                  refershLocalCopyOfChromeStorage();
                  closeMock();
                }
              );
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
