import React from "react";
import { Tabs } from "../../../components/Tabs";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";
import { HeaderView } from "./HeaderView";
import { RequestView } from "./RequestView";
import { ResponseView } from "./ResponseView";
import { ResponseRawView } from "./ResponseRawView";
import { useNetworkTabs } from "../../../hooks/useNetworkTabs";
import { CloseButton } from "../../../components/CloseButton";
import { NetworkMock } from "../NetworkMock";
import SplitPane from "react-split-pane";

export type NetworkDetailsProps = {
  data: NetworkRequest;
  onClose: () => void;
};

export const NetworkDetails = (props: NetworkDetailsProps) => {
  const { data, onClose } = props;
  const { activeTab, setActiveTab } = useNetworkTabs();
  const requestHeaders = data.request.headers;
  const responseHeaders = data.response?.headers || [];
  const requestBody = data.request.body;
  const responseBody = data.response?.body;
  const [isMocked, setIsMocked] = React.useState(false);
  const toggleMocked = () => setIsMocked(!isMocked);
  const mockButton = (
    <button
      className={`${
        !isMocked
          ? "bg-gray-300 dark:bg-gray-600 opacity-50 hover:opacity-100"
          : "bg-red-800"
      } rounded-lg px-3 py-1.5 font-bold  transition-opacity`}
      data-testid="copy-button"
      onClick={() => {
        toggleMocked();
      }}
    >
      {isMocked ? "Mocked" : "Mock"}
    </button>
  );

  const tabs = (
    <Tabs
      testId="network-tabs"
      activeTab={activeTab}
      onTabClick={setActiveTab}
      rightContent={<CloseButton onClick={onClose} testId="close-side-panel" />}
      tabs={[
        {
          id: "headers",
          title: "Headers",
          component: (
            <HeaderView
              requestHeaders={requestHeaders}
              responseHeaders={responseHeaders}
            />
          ),
        },
        {
          id: "request",
          title: "Request",
          component: (
            <RequestView requests={requestBody} mockButton={mockButton} />
          ),
        },
        {
          id: "response",
          title: "Response",
          component: <ResponseView response={responseBody} />,
        },
        {
          id: "response-raw",
          title: "Response (Raw)",
          component: <ResponseRawView response={responseBody} />,
        },
      ]}
    />
  );
  return isMocked ? (
    <SplitPane split="vertical" defaultSize="60%">
      {tabs}
      <NetworkMock response={responseBody} requests={requestBody} data={data} />
    </SplitPane>
  ) : (
    tabs
  );
};
