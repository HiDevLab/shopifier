'use strict';

import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';

import { Admin } from './admin';
import { AdminAuthLogout, AdminAuthLogin, AdminAuthRecover, AdminAuthReset } from './admin.auth'

@Component({
  selector: "admin",
  template : "<router-outlet></router-outlet>",
  directives: [ROUTER_DIRECTIVES],
  providers: [ROUTER_PROVIDERS],
})
@RouteConfig([
    {
        path : '/auth/login',
        name : 'Login',
        component : AdminAuthLogin,
        useAsDefault : false,
    },
     
    {
        path : '/auth/logout',
        name : 'Logout',
        component : AdminAuthLogout,
        useAsDefault : false,
    },
     
    {
        path : '/auth/recover',
        name : 'Recover',
        component : AdminAuthRecover,
        useAsDefault : false,
    },
     
    {
        path : '/auth/reset/:pk/:token/',
        name : 'Reset',
        component : AdminAuthReset,
        useAsDefault : false,
    }, 
    
    {
        path : '/',
        name : 'Admin',
        component : Admin,
        useAsDefault : true,
    },
    
])
export class AdminRouter {
}
