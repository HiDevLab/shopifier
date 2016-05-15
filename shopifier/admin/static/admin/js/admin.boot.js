import { bootstrap }    from 'angular2/platform/browser';
import { ROUTER_BINDINGS, RouteConfig, Router, RouterOutlet, RouterLink,  ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from 'angular2/router';
import { HTTP_PROVIDERS } from 'angular2/http';
import { FORM_PROVIDERS, COMMON_DIRECTIVES } from 'angular2/common';
import { Component } from 'angular2/core';

import { AdminAuthService, AdminAuthLogout, AdminAuthLogin, AdminAuthRecover, AdminAuthReset } from './admin.auth'
import { Admin } from './admin'

@Component({
  selector: "admin",
  template : "<router-outlet></router-outlet>",
  directives: [RouterOutlet, RouterLink],
  providers: [ROUTER_PROVIDERS],
})
@RouteConfig([
    {
        path : '/auth/login',
        name : 'Login',
        component : AdminAuthLogin,
    },
     
    {
        path : '/auth/logout',
        name : 'Logout',
        component : AdminAuthLogout,
    },
     
    {
        path : '/auth/recover',
        name : 'Recover',
        component : AdminAuthRecover,
    },
     
    {
        path : '/auth/reset/:pk/:token/',
        name : 'Reset',
        component : AdminAuthReset,
    }, 
    
    {
        path : '/...',
        name : 'Admin',
        component : Admin,
    },
    
])
export class AdminRouter {
    
    static get parameters() {
        return [[Router]];
    }

    constructor(router) {
        this._router = router;
    }
/*
    ngOnInit() {
        this._router.navigate(['Login']);
    }
*/
}
import {enableProdMode} from 'angular2/core';
enableProdMode();

bootstrap(AdminRouter, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    FORM_PROVIDERS,
    AdminAuthService
]).then((appRef) => window.injector = appRef.injector);
