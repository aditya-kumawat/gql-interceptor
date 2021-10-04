import React, { useState } from "react";
import { Textfield } from "../../../components/Textfield";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";

type NetworkMockProps = {
  data: NetworkRequest;
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
  const [searchInput, setSearchInput] = useState(
    JSON.stringify(mockUserSettings)
  );
  const { data } = props;
  const operationName = data.request.primaryOperation;

  return (
    <div className="p-2">
      {operationName.operationName}
      <Textfield
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search full request"
        autoFocus
        className="w-full"
        testId="search-input"
      />
      <button
        onClick={() =>
          chrome.storage.local.set({ UserSettingsQuery: searchInput }, () => {
            console.log("Saved the settings");
          })
        }
      >
        Save
      </button>
    </div>
  );
};
