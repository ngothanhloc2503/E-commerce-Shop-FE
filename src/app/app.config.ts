import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { GeneralSettingService } from './core/services/general-setting/general-setting.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideOAuthClient(),

    GeneralSettingService,

    // APP_INITIALIZER chỉ cho settings
    {
      provide: APP_INITIALIZER,
      useFactory: (settings: GeneralSettingService) => () => settings.loadSettings(),
      deps: [GeneralSettingService],
      multi: true,
    },
  ],
};