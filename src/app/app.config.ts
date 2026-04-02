import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthStateService } from './core/services/auth-state/auth-state.service';
import { GeneralSettingService } from './core/services/general-setting/general-setting.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideOAuthClient(),
    AuthStateService,
    GeneralSettingService,

    // APP_INITIALIZER để hydrate auth + settings
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthStateService, settings: GeneralSettingService) => {
        return () => {
          auth.init();
          return settings.loadSettings();
        };
      },
      deps: [AuthStateService, GeneralSettingService],
      multi: true
    }
  ]
};
