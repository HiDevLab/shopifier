'use strict';
/*
(function(app) {
  app.AdminRouter =
    ng.core.Component({
      "selector"    : "admin",
      "template"    : "<router-outlet></router-outlet>",
      "directives"  : [ng.router.ROUTER_DIRECTIVES,],
     })
    .Class({
        constructor : [
            ng.http.Http,
            ng.router.Router,
            ng.common.FormBuilder,
            function(http, router, formbuilder) {
                app.Http = http;
                app.Router = router;
                app.FormBuilder = formbuilder;                
            }
        ],
    });
    
// @RouteConfig begin  
    ng.router.RouteConfig([ 
    
    {
      path : '/',
      name : 'Admin',
      component : app.Admin,
      useAsDefault : true,
      
    },
    
    {
      path : '/auth/login',
      name : 'Login',
      component : app.AdminAuthLogin,
      useAsDefault : false
    }, 
    
    {
      path : '/auth/logout',
      name : 'Logout',
      component : app.AdminAuthLogin,
      useAsDefault : false
    }, 
  ])(app.AdminRouter);
 // @RouteConfig end 
  
})(window.app || (window.app = {}));
*/

import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';

import { Admin } from './admin';
import { AdminAuthLogin, AdminAuthRecover, AdminAuthReset } from './admin.auth'

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
        path : '/auth/recover',
        name : 'Recover',
        component : AdminAuthRecover,
        useAsDefault : false,
    },
     
    {
        path : '/auth/reset/:pk/:token/',
        name : 'Reset',
        component : AdminAuthReset,
        useAsDefault : true,
    }, 
    
    {
        path : '/',
        name : 'Admin',
        component : Admin,
        useAsDefault : false,
    },
    
])
export class AdminRouter {
}
