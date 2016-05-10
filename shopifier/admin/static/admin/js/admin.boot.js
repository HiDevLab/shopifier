'use strict';
import { bootstrap }    from 'angular2/platform/browser';
import { ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from 'angular2/router';
import { HTTP_PROVIDERS } from 'angular2/http';
import { FORM_PROVIDERS, COMMON_DIRECTIVES } from 'angular2/common';

import { AdminRouter } from './admin';
import { AdminAuthService } from './admin.auth'

//bootstrap(AdminRouter, [ROUTER_PROVIDERS, HTTP_PROVIDERS, FORM_PROVIDERS, COMMON_DIRECTIVES, ROUTER_DIRECTIVES,]);

bootstrap(AdminRouter, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    FORM_PROVIDERS,
    AdminAuthService
]).then((appRef) => window.injector = appRef.injector);

