// File: src/app/app.config.ts

import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { createUploadLink } from './create-upload-link'; // Our wrapper module
import { InMemoryCache } from '@apollo/client/core';
import { provideAnimations } from '@angular/platform-browser/animations';

// Custom interceptor for authentication
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Import environment configuration
import { environment } from '../environments/environment';

console.log('Using GraphQL endpoint:', environment.graphqlUrl); // Debugging log

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // Use hash location strategy which works better with Netlify's routing
    provideRouter(appRoutes, withHashLocation()),
    provideAnimations(),
    provideApollo(() => {
      return {
        cache: new InMemoryCache(),
        link: createUploadLink({
          uri: environment.graphqlUrl,
          credentials: 'include', // Include credentials if your API requires them
          headers: {
            'Apollo-Require-Preflight': 'true', // Required for file uploads
            'Content-Type': 'application/json',
            // Add an origin header to help with CORS
            'Origin': isDevMode() ? 'http://localhost:4200' : 'https://curious-fudge-8cd8c7.netlify.app'
          },
        }),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
          },
          query: {
            fetchPolicy: 'network-only', // Don't use cache for queries in production
            errorPolicy: 'all'
          },
          mutate: {
            errorPolicy: 'all'
          }
        },
      };
    })
  ],
};
