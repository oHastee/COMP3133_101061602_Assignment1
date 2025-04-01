// File: frontend/src/typings/apollo-upload-client.mjs.d.ts

declare module 'apollo-upload-client/createUploadLink.mjs' {
  import { ApolloLink } from '@apollo/client/core';

  interface UploadLinkOptions {
    uri?: string;
    credentials?: string;
    headers?: Record<string, string>;
    fetch?: WindowOrWorkerGlobalScope['fetch'];
  }

  export function createUploadLink(options?: UploadLinkOptions): ApolloLink;
}
