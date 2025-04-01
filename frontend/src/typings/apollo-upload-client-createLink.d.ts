// File: frontend/src/typings/apollo-upload-client-createLink.d.ts

declare module 'apollo-upload-client/createUploadLink.mjs' {
  import { ApolloLink } from '@apollo/client/core';

  export interface UploadLinkOptions {
    uri?: string;
    credentials?: string;
    headers?: Record<string, string>;
    fetch?: WindowOrWorkerGlobalScope['fetch'];
  }

  const createUploadLink: (options?: UploadLinkOptions) => ApolloLink;
  export default createUploadLink;
}
