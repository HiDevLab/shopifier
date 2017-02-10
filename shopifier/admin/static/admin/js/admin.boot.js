import 'rxjs/Rx';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, provide } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { Http, RequestOptions, XHRBackend } from '@angular/http';

import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Admin, AdminHome, AdminSearch, PermissionsPipe,
    CheckPermission } from './admin';
import { AdminAuthModule, SuperHttp, CanActivateAdmin,
    CanDeactivateGuard } from './admin.auth';
import { AdminCustomersModule, AdminCustomers,
    AdminCustomersNew, AdminCustomersEdit } from './admin.customers';
import { AdminCollectionsModule, AdminCollections, AdminCollectionsNew,
    AdminCollectionsEdit} from './admin.collections';
import { AdminComponentsModule } from './components';
import { AdminOrdersModule, AdminOrdersOrders, AdminOrdersDrafts,
    } from './admin.orders';
import { AdminTransfers, AdminProducts, AdminProductsNew, AdminProductsEdit,
        AdminProductsModule } from './admin.products';
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
        { path : 'settings', redirectTo: '/settings/general', pathMatch: 'full' },
        { path : 'settings/general', component : AdminSettingsGeneral, canActivate: [CheckPermission] },
        { path : 'settings/checkout', component : AdminSettingsCheckout, canActivate: [CheckPermission] },
        { path : 'settings/account', component : AdminAccount, canActivate: [CheckPermission] },
        { path : 'settings/account/:id', component : AdminAccountProfile, canActivate: [CheckPermission], canDeactivate: [CanDeactivateGuard] },
        { path : 'customers', component : AdminCustomers, canActivate: [CheckPermission] },
        { path : 'customers/new', component : AdminCustomersNew, canActivate: [CheckPermission] },
        { path : 'customers/:id', component : AdminCustomersEdit, canActivate: [CheckPermission], canDeactivate: [CanDeactivateGuard] },
        { path : 'orders', redirectTo: '/orders/orders', pathMatch: 'full' },
        { path : 'orders/orders', component : AdminOrdersOrders, canActivate: [CheckPermission] },
        { path : 'orders/drafts', component : AdminOrdersDrafts, canActivate: [CheckPermission] },
        { path : 'products', component : AdminProducts, canActivate: [CheckPermission] },
        { path : 'products/new', component : AdminProductsNew, canActivate: [CheckPermission] },
        { path : 'products/:id', component : AdminProductsEdit, canActivate: [CheckPermission], canDeactivate: [CanDeactivateGuard] },
        { path : 'transfers', component : AdminTransfers, canActivate: [CheckPermission] },
        { path : 'collections', component : AdminCollections, canActivate: [CheckPermission] },
        { path : 'collections/new', component : AdminCollectionsNew, canActivate: [CheckPermission] },
        { path : 'collections/:id', component : AdminCollectionsEdit, canActivate: [CheckPermission], canDeactivate: [CanDeactivateGuard] },

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
        AdminProductsModule,
        AdminCollectionsModule,
    ],
    providers: [
        Admin,
        {
            provide: Http, 
            useFactory: (backend, defaultOptions) => new SuperHttp(backend, defaultOptions),
            deps: [XHRBackend, RequestOptions]
        },
        CheckPermission,
    ],
    declarations: [ 
        AdminRoot,
        Admin,
        AdminHome,
        AdminSearch,
        PermissionsPipe,
    ],
    schemas: [NO_ERRORS_SCHEMA],
    bootstrap: [AdminRoot]
})
export class AdminModule {}

platformBrowserDynamic().bootstrapModule(AdminModule);
