import { bootstrap }    from 'angular2/platform/browser';

import { ROUTER_BINDINGS, RouteConfig, Router, RouterOutlet, RouterLink, ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from 'angular2/router';
import { HTTP_PROVIDERS, ConnectionBackend, Http, Headers, BaseRequestOptions, RequestOptions, XHRBackend} from 'angular2/http';
import { FORM_PROVIDERS, COMMON_DIRECTIVES } from 'angular2/common';
import { Component, provide, Injectable, Injector } from 'angular2/core';
import 'rxjs/Rx';

import { AdminAuthService, AdminUtils, AdminAuthLogout, AdminAuthLogin, AdminAuthRecover, AdminAuthReset, AdminAuthAccept, AdminAuthWrongToken } from './admin.auth'
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


@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions{
    
    constructor(http, router) {
        super();
        let csrftoken = this.getCookie('csrftoken');
        console.log(csrftoken);
        this.headers = new Headers({'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8',
                'X-CSRFToken': csrftoken});
    }
    
    getCookie(name) {
        console.log(document.cookie);
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length == 2) 
            return parts.pop().split(";").shift();
    }
    
}

@Injectable()
export class SuperHttp extends Http {
  
    static get parameters() {
            return [[ConnectionBackend], [RequestOptions]];
    }
    constructor(backend, defaultOptions) {
        super(backend, defaultOptions);
    }

    request(url, options){
        return super.request(url, options);
    }

    post(url, data) {
        let body = JSON.stringify(data);
        return super.post(url, body).map(res => res.json());
    }
    
    put(url, data) {
        let body = JSON.stringify(data);
        return super.put(url, body).map(res => res.json());
    }
    
    patch(url, data) {
        let body = JSON.stringify(data);
        return super.patch(url, body).map(res => res.json());
    }

    get(url) {
        return super.get(url).map(res => res.json());
    }
     
    delete(url) {
        return super.delete(url);
    }
}


bootstrap(AdminRouter, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide( RequestOptions, { useClass: DefaultRequestOptions }),
    provide(Http, {
        useFactory: (backend, defaultOptions) => new SuperHttp(backend, defaultOptions),
        deps: [XHRBackend, RequestOptions]
    }),
    FORM_PROVIDERS,
    AdminAuthService,
    AdminUtils
]).then((appRef) => window.injector = appRef.injector);
