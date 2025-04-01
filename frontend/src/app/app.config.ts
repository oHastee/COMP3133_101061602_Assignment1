// File: frontend/src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { createUploadLink } from './create-upload-link'; // Our wrapper module
import { InMemoryCache } from '@apollo/client/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(appRoutes),
    provideApollo(() => {
      return {
        link: createUploadLink({ uri: 'http://localhost:3000/graphql' }),
        cache: new InMemoryCache()
      };
    })
  ],
};
