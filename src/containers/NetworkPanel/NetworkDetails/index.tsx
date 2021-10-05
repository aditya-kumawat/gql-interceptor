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
import { getInterceptionRule } from "@/services/interceptionRules";

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
  const toggleMocked = () => setIsMockPanelOpen(!isMockPanelOpen);
  const origin =
    data.request.headers.find((header) => header.name === "origin")?.value ??
    "http://localhost: 3000";
  const operationName = data.request.primaryOperation.operationName;
  const matchingRule = getInterceptionRule(
    operationName,
    origin,
    requestBody[0].variables
  );
  const [isMockPanelOpen, setIsMockPanelOpen] = React.useState(
    Boolean(matchingRule)
  );
  const mockButton = !isMockPanelOpen && (
    <button
      className="bg-gray-300 dark:bg-gray-600 opacity-50 hover:opacity-100 rounded-lg px-3 py-1.5 font-bold  transition-opacity"
      onClick={() => {
        toggleMocked();
      }}
    >
      {Boolean(matchingRule) ? "Edit interception" : "Add interception"}
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

  return isMockPanelOpen ? (
    <SplitPane split="vertical" defaultSize="60%">
      {tabs}
      <NetworkMock
        response={responseBody}
        requests={requestBody}
        data={data}
        origin={origin}
        matchingRule={matchingRule}
        closeMock={() => {
          setIsMockPanelOpen(false);
          onClose();
        }}
      />
    </SplitPane>
  ) : (
    tabs
  );
};
