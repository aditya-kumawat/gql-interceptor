import { hashPayload, IInterceptorPayload } from "@/extension.utils";
import { IGraphqlRequestBody } from "@/helpers/graphqlHelpers";
import { chromeProvider } from "@/services/chromeProvider";
import { useState } from "react";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";

type NetworkMockProps = {
  data: NetworkRequest;
  response?: string;
  requests: IGraphqlRequestBody[];
};

const mockUserSettings = {
  data: {
    userSettings: {
      settings: [
        {
          setting: "APP_THEME",
          value: '"BRIGHT"',
          __typename: "UserSetting",
        },
      ],
      __typename: "UserSettings",
    },
  },
};

export const NetworkMock = (props: NetworkMockProps) => {
  const chrome = chromeProvider();
  const { data, requests, response } = props;
  const [searchInput, setSearchInput] = useState(
    response ?? JSON.stringify(mockUserSettings)
  );
  const hash = requests[0].variables ? hashPayload(requests[0].variables) : "*";

  const operationName = data.request.primaryOperation.operationName;

  return (
    <div className="flex flex-col h-full border-l border-gray-300 dark:border-gray-600">
      <Editor
        value={mockUserSettings}
        onChange={(json: object) => setSearchInput(JSON.stringify(json))}
        navigationBar={false}
        statusBar={false}
        search={true}
        mode="code"
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
            chrome.storage.local.set({ [`${operationName}:*`]: x }, () => {
              console.log("Saved the settings", {
                [`${operationName}:*`]: x,
              });
            });
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
                  payload: searchInput,
                },
              },
            };
            chrome.storage.local.set(
              { [`${operationName}:${hash}`]: x },
              () => {
                console.log("Saved the settings", {
                  [`${operationName}:${hash}`]: x,
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
                patchPayload: JSON.parse(searchInput),
              },
            };
            chrome.storage.local.set({ [`${operationName}:*`]: x }, () => {
              console.log("Saved the settings", {
                [`${operationName}:*`]: x,
              });
            });
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
                patchPayload: JSON.parse(searchInput),
              },
            };
            chrome.storage.local.set(
              { [`${operationName}:${hash}`]: x },
              () => {
                console.log("Saved the settings", {
                  [`${operationName}:${hash}`]: x,
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
