export interface IInterceptorPayload {
  // Modify the request if the following is truthy
  request?: {
    appendHeaders?: Record<string, string>; // {key: value}
    payload?: string;
  };
  response?: {
    // Modify the response if the following is truthy
    replace?: {
      payload: string;
      // add this timeout if the server responds quicker
      timeout?: number; // default 0
    };
    // Modify the response if the following is truthy
    patchPayload?: object;
  };
}

export const hashPayload = (payload: object): number => {
  let hash = 0;
  const payloadStr = JSON.stringify(payload);
  if (payloadStr.length === 0) return hash;
  for (let i = 0; i < payloadStr.length; i++) {
    const chr = payloadStr.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
