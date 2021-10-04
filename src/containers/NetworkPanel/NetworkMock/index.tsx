import { hashPayload, IInterceptorPayload } from "@/extension.utils";
import { IGraphqlRequestBody } from "@/helpers/graphqlHelpers";
import { chromeProvider } from "@/services/chromeProvider";
import React, { useState } from "react";
import { Textfield } from "../../../components/Textfield";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";

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
    <div className="p-2">
      <div style={{ margin: "10px" }}>
        <Textfield
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search full request"
          autoFocus
          className="w-full"
          testId="search-input"
        />
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
