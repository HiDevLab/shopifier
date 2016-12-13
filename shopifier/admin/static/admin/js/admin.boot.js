import 'rxjs/Rx';

import { bootstrap } from 'angular2/platform/browser';
import { FORM_PROVIDERS, COMMON_DIRECTIVES } from 'angular2/common';
import { Component, provide, Injectable, Injector } from 'angular2/core';
import { ROUTER_BINDINGS, RouteConfig, Router, RouterOutlet, RouterLink, 
        ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from 'angular2/router';
import { HTTP_PROVIDERS, ConnectionBackend, Http, Headers, BaseRequestOptions, 
        Request, RequestOptions, XHRBackend,RequestMethod} from 'angular2/http';

import { Admin } from './admin';
import { AdminAuthService, AdminUtils, AdminAuthLogout,
        AdminAuthLogin, AdminAuthRecover, AdminAuthReset,
        AdminAuthAccept, AdminAuthWrongToken } from './admin.auth';
import { Customers } from './admin.customers';


@Component({
  selector: "body",
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
        path : '/auth/accept/:id/:token/',
        name : 'Accept',
        component : AdminAuthAccept,
    },
    
    {
        path : '/auth/wrong_token/',
        name : 'WrongToken',
        component : AdminAuthWrongToken,
    },
    
    {
        path : '/...',
        name : 'Admin',
        component : Admin,
    },
    
])
export class AdminRouter {
}

import {enableProdMode} from 'angular2/core';
enableProdMode();

/*
@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions{
    
    constructor(http, router) {
        super();
        this.headers = new Headers({'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8'});
    }
}
*/

@Injectable()
export class SuperHttp extends Http {
  
    static get parameters() {
        return [[ConnectionBackend], [RequestOptions]];
    }
    constructor(backend, defaultOptions) {
        super(backend, defaultOptions);
        this.requestoptions = new RequestOptions({});
        this.requestoptions.headers = new Headers({
                    'Accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-CSRFToken': ''
                });
    }

    csrfToken() {
        let value = '; ' + document.cookie;
        let parts = value.split('; csrftoken=');
        if (parts.length == 2){ 
            this.requestoptions
                .headers.set('X-CSRFToken', parts.pop().split(";").shift());
        }
    }

    request(method, url, data){
        this.csrfToken();
        this.requestoptions.method = RequestMethod[method];
        this.requestoptions.url= url;
        this.requestoptions.body = (data) ? JSON.stringify(data) : undefined;
        let request = new Request(this.requestoptions);
        return super.request(request).map(res => res.json());
    }

    post(url, data) {
        return this.request('Post', url, data);
    }

    put(url, data) {
        return this.request('Put', url, data);
    }

    patch(url, data) {
        return this.request('Patch', url, data);
    }

    get(url) {
        return this.request('Get', url);
    }

    options(url) {
        return this.request('Options', url);
    }

    delete(url) {
        this.csrfToken();
        return super.delete(url, {headers: this.requestoptions.headers});
    }
}


bootstrap(AdminRouter, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    //provide( RequestOptions, { useClass: DefaultRequestOptions }),
    provide(Http, {
        useFactory: (backend, defaultOptions) => 
                        new SuperHttp(backend, defaultOptions),
        deps: [XHRBackend, RequestOptions]
    }),
    FORM_PROVIDERS,
    AdminAuthService,
    AdminUtils,
]).then((appRef) => window.injector = appRef.injector);
