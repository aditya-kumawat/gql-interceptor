import { IInterceptorPayload } from "../extension.utils";

export interface IResponse {
  readonly operationName?: string;
  readonly mockResponse?: string;
  readonly mockRequest?: IInterceptorPayload["request"];
  readonly patchResponse?: object;
}
