import { Component, DynamicComponentLoader, ViewContainerRef } from 'angular2/core';
import { Router, RouteParams, RouteConfig, ROUTER_DIRECTIVES,  } from 'angular2/router'
import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, Validators, Control } from 'angular2/common';
import { Http } from 'angular2/http'
import 'rxjs/Rx'

import { AdminAuthService, AdminUtils } from './admin.auth'
import { Admin } from './admin'

import { AdminLeavePage } from './components';


//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminOrdersOrders {
    component = 'Orders';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminOrdersDrafts {
    component = 'Drafts';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminOrdersTransfers {
    component = 'Transfers';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------ 
@Component({
  selector: 'main',
  template : '<router-outlet></router-outlet>',
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([
     {
         path : '/',
         redirectTo: ['Orders'],
     }, 

    {
        path : '/orders',
        name : 'Orders',
        component : AdminOrdersOrders
    },

    {
        path : '/drafts',
        name : 'Drafts',
        component : AdminOrdersDrafts
    },

    {
        path : '/transfers',
        name : 'Transfers',
        component : AdminOrdersTransfers
    },

])
export class AdminOrders {
}
