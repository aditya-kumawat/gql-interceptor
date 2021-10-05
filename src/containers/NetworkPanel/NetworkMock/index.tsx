import { hashPayload, IInterceptorPayload } from "@/extension.utils";
import { IGraphqlRequestBody } from "@/helpers/graphqlHelpers";
import { chromeProvider } from "@/services/chromeProvider";
import React, { useState } from "react";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";
import ace from "brace";
import { Checkbox } from "@/components/Checkbox";

type NetworkMockProps = {
  data: NetworkRequest;
  response?: string;
  requests: IGraphqlRequestBody[];
  origin: string;
};

const chrome = chromeProvider();
export const NetworkMock = (props: NetworkMockProps) => {
  const { data, requests, response, origin } = props;
  const [responsePayload, setResponsePayload] = useState("");
  const [variablesPayload, setVariablesPayload] = useState(
    requests[0].variables ?? {}
  );
  const [interceptType, setInterceptType] = useState("all");
  const onChangeInterceptRadio = (event: React.ChangeEvent<HTMLInputElement>) =>
    setInterceptType(event.target.value);
  const [responseMod, setResponseMod] = useState("doNotModify");
  const onChangeResponseModRadio = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setResponseMod(event.target.value);
  const [modifyVariable, setModifyVariables] = useState(false);
  const [modifyHeaders, setModifyHeaders] = useState(false);
  const [headersPayload, setHeadersPayload] = useState({});

  const responseJson = response ? JSON.parse(response) : {};
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
            value={responseJson}
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
              }
            );
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};
