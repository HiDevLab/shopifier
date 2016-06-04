import { bootstrap }    from 'angular2/platform/browser';

import { ROUTER_BINDINGS, RouteConfig, Router, RouterOutlet, RouterLink, 
        ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from 'angular2/router';
import { HTTP_PROVIDERS, ConnectionBackend, Http, Headers, BaseRequestOptions, 
        Request, RequestOptions, XHRBackend,RequestMethod} from 'angular2/http';
import { FORM_PROVIDERS, COMMON_DIRECTIVES } from 'angular2/common';
import { Component, provide, Injectable, Injector } from 'angular2/core';
import 'rxjs/Rx';

import { AdminAuthService, AdminUtils, AdminAuthLogout, AdminAuthLogin, 
        AdminAuthRecover, AdminAuthReset, AdminAuthAccept, AdminAuthWrongToken } 
from './admin.auth'

import { Admin } from './admin'

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
        let value = "; " + document.cookie;
        let parts = value.split("; csrftoken=");
        if (parts.length == 2){ 
            this.requestoptions.headers.set('X-CSRFToken', parts.pop().split(";").shift());
        }
    }
    
    request(url, method, data){
        this.csrfToken();
        this.requestoptions.method = RequestMethod[method];
        this.requestoptions.url= url;
        if (data) this.requestoptions.body = JSON.stringify(data); 
        let request = new Request(this.requestoptions);
        return super.request(request).map(res => res.json());
    }

    post(url, data) {
        return this.request(url, 'Post', data);
    }

    put(url, data) {
        return this.request(url, 'Put', data);
    }

    patch(url, data) {
        return this.request(url, 'Patch', data);
    }

    get(url) {
        return this.request(url, 'Get');
    }
     
    options(url) {
        return this.request(url, 'Options');
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
        useFactory: (backend, defaultOptions) => new SuperHttp(backend, defaultOptions),
        deps: [XHRBackend, RequestOptions]
    }),
    FORM_PROVIDERS,
    AdminAuthService,
    AdminUtils
]).then((appRef) => window.injector = appRef.injector);
