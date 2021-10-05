import { hashPayload, IInterceptorPayload } from "@/extension.utils";
import { IGraphqlRequestBody } from "@/helpers/graphqlHelpers";
import { chromeProvider } from "@/services/chromeProvider";
import { useState } from "react";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";
import ace from "brace";

type NetworkMockProps = {
  data: NetworkRequest;
  response?: string;
  requests: IGraphqlRequestBody[];
  origin: string;
};

const chrome = chromeProvider();
export const NetworkMock = (props: NetworkMockProps) => {
  const { data, requests, response, origin } = props;
  const [searchInput, setSearchInput] = useState("");

  const variables = requests[0].variables ?? {};
  const responseJson = response ? JSON.parse(response) : {};
  const hash = requests[0].variables ? hashPayload(requests[0].variables) : "*";

  const operationName = data.request.primaryOperation.operationName;

  return (
    <div className="flex flex-col h-full border-l border-gray-300 dark:border-gray-600 scroll overflow-y-scroll">
      <div className="flex items-center pl-2" style={{ height: "3.5rem" }}>
        <h2 className="font-bold">Replace variables</h2>
      </div>
      <Editor
        value={variables}
        navigationBar={false}
        statusBar={false}
        search={true}
        mode="code"
        ace={ace}
      />
      <div className="flex items-center pl-2" style={{ height: "3.5rem" }}>
        <h2 className="font-bold">Patch response</h2>
      </div>
      <Editor
        value={responseJson}
        onChange={(json: object) => setSearchInput(JSON.stringify(json))}
        navigationBar={false}
        statusBar={false}
        search={true}
        mode="code"
        ace={ace}
      />
      <div style={{ margin: "20px " }}>
        <button
          className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-1.5 font-bold opacity-50 hover:opacity-100 transition-opacity"
          onClick={() => {
            const x: IInterceptorPayload = {
              response: {
                replace: {
                  payload: searchInput,
                },
              },
            };
            chrome.storage.local.set(
              { [`${origin}:${operationName}:*`]: x },
              () => {
                console.log("Saved the settings", {
                  [`${origin}:${operationName}:*`]: x,
                });
              }
            );
          }}
        >
          Replace all {operationName}
        </button>
      </div>
      <div style={{ margin: "20px " }}>
        <button
          className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-1.5 font-bold opacity-50 hover:opacity-100 transition-opacity"
          onClick={() => {
            const x: IInterceptorPayload = {
              response: {
                replace: {
                  payload: searchInput.trim(),
                },
              },
            };
            chrome.storage.local.set(
              { [`${origin}:${operationName}:${hash}`]: x },
              () => {
                console.log("Saved the settings", {
                  [`${origin}:${operationName}:${hash}`]: x,
                });
              }
            );
          }}
        >
          Replace this query alone
        </button>
      </div>
      <div style={{ margin: "20px " }}>
        <button
          className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-1.5 font-bold opacity-50 hover:opacity-100 transition-opacity"
          onClick={() => {
            const x: IInterceptorPayload = {
              response: {
                patchPayload: JSON.parse(searchInput.trim()),
              },
            };
            chrome.storage.local.set(
              { [`${origin}:${operationName}:*`]: x },
              () => {
                console.log("Saved the settings", {
                  [`${origin}:${operationName}:*`]: x,
                });
              }
            );
          }}
        >
          Patch all {operationName}
        </button>
      </div>
      <div style={{ margin: "20px " }}>
        <button
          className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-1.5 font-bold opacity-50 hover:opacity-100 transition-opacity"
          onClick={() => {
            const x: IInterceptorPayload = {
              response: {
                patchPayload: JSON.parse(searchInput.trim()),
              },
            };
            chrome.storage.local.set(
              { [`${origin}:${operationName}:${hash}`]: x },
              () => {
                console.log("Saved the settings", {
                  [`${origin}:${operationName}:${hash}`]: x,
                });
              }
            );
          }}
        >
          Patch this query alone
        </button>
      </div>
    </div>
  );
};
