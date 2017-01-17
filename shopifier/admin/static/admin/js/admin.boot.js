import 'rxjs/Rx';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, provide } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { Http, RequestOptions, XHRBackend } from '@angular/http';

import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Admin, AdminHome, AdminSearch } from './admin';
import { AdminAuthModule, SuperHttp, CanActivateAdmin, CanDeactivateGuard } from './admin.auth';
import { Customers } from './admin.customers';
import { AdminComponentsModule } from './components';
import { AdminSettingsModule, AdminSettingsGeneral, AdminSettingsCheckout,
    AdminAccount, AdminAccountProfile } from './admin.settings';


import {enableProdMode} from '@angular/core';
enableProdMode();


@Component({
  selector: 'body',
  template : '<router-outlet></router-outlet>',
})
export class AdminRoot {}

const routes = [
//     { path : '', component: Admin, canActivate: [CanActivateAdmin], children: [
    { path : '', component: Admin, canActivate: [CanActivateAdmin], children: [
        { path : '', redirectTo: '/home', pathMatch: 'full' },
        { path : 'home', component : AdminHome },
        { path : 'search', component : AdminSearch, },
        { path : 'settings', redirectTo: '/settings/general', pathMatch: 'full'},
        { path : 'settings/general', component : AdminSettingsGeneral },
        { path : 'settings/checkout', component : AdminSettingsCheckout },
        { path : 'settings/account', component : AdminAccount },
        { path : 'settings/account/:id', component : AdminAccountProfile, canDeactivate: [CanDeactivateGuard] },

    ]},
]
export const routing = RouterModule.forRoot(routes);

@NgModule({
    imports: [
        RouterModule.forRoot(routes), 
        BrowserModule,
        AdminAuthModule,
        AdminComponentsModule,
        AdminSettingsModule
    ],
    providers: [
        Admin,
        {
            provide: Http, 
            useFactory: (backend, defaultOptions) => new SuperHttp(backend, defaultOptions),
            deps: [XHRBackend, RequestOptions]
        },
    ],
    declarations: [ 
        AdminRoot,
        Admin,
        AdminHome,
        AdminSearch,
    ],
    schemas: [NO_ERRORS_SCHEMA],
    bootstrap: [AdminRoot]
})
export class AdminModule {}

platformBrowserDynamic().bootstrapModule(AdminModule);
