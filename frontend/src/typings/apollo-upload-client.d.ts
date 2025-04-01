// File: frontend/src/typings/apollo-upload-client.d.ts

declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client/core';

  export interface UploadLinkOptions {
    uri?: string;
    credentials?: string;
    headers?: Record<string, string>;
    fetch?: WindowOrWorkerGlobalScope['fetch'];
  }

  export function createUploadLink(options?: UploadLinkOptions): ApolloLink;
}
