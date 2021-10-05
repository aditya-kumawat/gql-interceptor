import React, { useMemo } from "react";
import * as safeJson from "../../../helpers/safeJson";
import { JsonView } from "../../../components/JsonView";
import { CopyButton } from "../../../components/CopyButton";

interface IResponseViewProps {
  response?: string;
  mockButton: React.ReactNode;
}

export const ResponseView = (props: IResponseViewProps) => {
  const { response, mockButton } = props;
  const { formattedJson, parsedResponse } = useMemo(() => {
    const parsedResponse = safeJson.parse(response) || {};
    return {
      formattedJson: safeJson.stringify(parsedResponse, undefined, 2),
      parsedResponse,
    };
  }, [response]);

  return (
    <div className="relative p-4">
      <div className="absolute right-6 top-20 z-10">{mockButton}</div>
      <CopyButton
        textToCopy={formattedJson}
        className="absolute right-6 top-6 z-10"
      />
      <JsonView src={parsedResponse} />
    </div>
  );
};
