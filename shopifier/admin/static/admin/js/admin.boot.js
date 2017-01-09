import 'rxjs/Rx';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, provide } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { Http, RequestOptions, XHRBackend } from '@angular/http';

import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Admin, AdminHome, AdminSearch } from './admin';
import { AdminAuthModule, SuperHttp, CanActivateAdmin } from './admin.auth';
import { Customers } from './admin.customers';


@Component({
  selector: "body",
  template : "<router-outlet></router-outlet>",
})
export class AdminRouter {}


import {enableProdMode} from '@angular/core';
enableProdMode();


@Component({
  selector: 'body',
  template : '<router-outlet></router-outlet>',
})
export class RootComponent {}

const routes = [
    { path : '', component: Admin, canActivate: [CanActivateAdmin], children: [
        { path : 'home', component : AdminHome },
        { path : 'search', component : AdminSearch, },
    ]},
]
export const routing = RouterModule.forRoot(routes);

@NgModule({
    imports: [
        RouterModule.forRoot(routes), 
        BrowserModule,
        AdminAuthModule
    ],
    providers: [
        {
            provide: Http, 
            useFactory: (backend, defaultOptions) => new SuperHttp(backend, defaultOptions),
            deps: [XHRBackend, RequestOptions]
        },
    ],
    declarations: [ 
        RootComponent,
        Admin,
        AdminHome,
        AdminSearch,
    ],
    schemas: [NO_ERRORS_SCHEMA],
    bootstrap: [RootComponent]
})
export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
