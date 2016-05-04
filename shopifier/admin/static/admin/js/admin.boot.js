'use strict';
/*
(function(app) {
    document.addEventListener('DOMContentLoaded', function() {
        ng.platform.browser.bootstrap(app.AdminRouter, [ng.router.ROUTER_PROVIDERS, ng.http.HTTP_PROVIDERS, ng.common.FORM_PROVIDERS]);
    });
        
    //SET HTTP HEADERS
    app.httpHeaders = new ng.http.Headers(
                {'Accept': 'application/json; charset=utf-8', 
                'Content-Type': 'application/json; charset=utf-8'}
            );
    app.httpOptions = new ng.http.RequestOptions({ headers: app.httpHeaders });
    
    app.currentUser = { 'id':0 };


})(window.app || (window.app = {}));
*/

import { bootstrap }    from 'angular2/platform/browser';
import { ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from 'angular2/router';
import { HTTP_PROVIDERS } from 'angular2/http';
import { FORM_PROVIDERS, COMMON_DIRECTIVES } from 'angular2/common';

import { AdminRouter } from './admin.router';

//bootstrap(AdminRouter, [ROUTER_PROVIDERS, HTTP_PROVIDERS, FORM_PROVIDERS, COMMON_DIRECTIVES, ROUTER_DIRECTIVES,]);

bootstrap(AdminRouter, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    FORM_PROVIDERS,
    COMMON_DIRECTIVES,
    ROUTER_DIRECTIVES,
]).then((appRef) => window.injector = appRef.injector);

