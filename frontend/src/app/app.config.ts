// File: src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { createUploadLink } from './create-upload-link'; // Our wrapper module
import { InMemoryCache } from '@apollo/client/core';
import { provideAnimations } from '@angular/platform-browser/animations';

// Custom interceptor for authentication
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Import environment configuration
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(appRoutes),
    provideAnimations(),
    provideApollo(() => {
      return {
        cache: new InMemoryCache(),
        link: createUploadLink({
          uri: environment.graphqlUrl,
          headers: {
            'Apollo-Require-Preflight': 'true', // Required for file uploads
          },
        }),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
          },
        },
      };
    })
  ],
};
