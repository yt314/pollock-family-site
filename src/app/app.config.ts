import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding מזרים את פרמטרי הכתובת (:id) ל-input של הקומפוננטה
    provideRouter(routes, withComponentInputBinding()),
  ],
};
