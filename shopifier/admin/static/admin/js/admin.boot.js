import 'rxjs/Rx';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, provide } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { Http, RequestOptions, XHRBackend } from '@angular/http';

import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Admin, AdminHome, AdminSearch } from './admin';
import { AdminAuthModule, SuperHttp, CanActivateAdmin,
    CanDeactivateGuard } from './admin.auth';
import { AdminCustomersModule, AdminCustomers,
    AdminCustomersNew, AdminCustomersEdit } from './admin.customers';
import { AdminComponentsModule } from './components';
import { AdminOrdersModule, AdminOrdersOrders, AdminOrdersDrafts,
    } from './admin.orders';
import { AdminCollections, AdminTransfers, AdminProducts,
        AdminProductsNew, AdminProductsEdit, AdminProductsModule } from './admin.products';
import { AdminSettingsModule, AdminSettingsGeneral, AdminSettingsCheckout,
    AdminAccount, AdminAccountProfile } from './admin.settings';


import {enableProdMode} from '@angular/core';
enableProdMode();


@Component({
  selector: 'body',
  template : '<router-outlet></router-outlet>',
  interpolation: ['[[', ']]'],
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
        { path : 'customers', component : AdminCustomers },
        { path : 'customers/new', component : AdminCustomersNew, },
        { path : 'customers/:id', component : AdminCustomersEdit, canDeactivate: [CanDeactivateGuard] },
        { path : 'orders', redirectTo: '/orders/orders', pathMatch: 'full'},
        { path : 'orders/orders', component : AdminOrdersOrders },
        { path : 'orders/drafts', component : AdminOrdersDrafts },
        { path : 'products', component : AdminProducts },
        { path : 'products/new', component : AdminProductsNew },
        { path : 'products/:id', component : AdminProductsEdit, canDeactivate: [CanDeactivateGuard] },
        { path : 'transfers', component : AdminTransfers },
        { path : 'collections', component : AdminCollections },
    ]},


]
export const routing = RouterModule.forRoot(routes);

@NgModule({
    imports: [
        RouterModule.forRoot(routes), 
        BrowserModule,
        AdminAuthModule,
        AdminComponentsModule,
        AdminSettingsModule,
        AdminCustomersModule,
        AdminOrdersModule,
        AdminProductsModule
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
