// In app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { createUploadLink } from './create-upload-link';
import { InMemoryCache } from '@apollo/client/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // Use hash location strategy
    provideRouter(appRoutes, withHashLocation()),
    provideAnimations(),
    provideApollo(() => {
      return {
        cache: new InMemoryCache(),
        link: createUploadLink({
          uri: environment.graphqlUrl,
          headers: {
            'Apollo-Require-Preflight': 'true',
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
