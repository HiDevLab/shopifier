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
export class AdminProductsProducts {
    component = 'Products';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminProductsCollections {
    component = 'Collections';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminProductsTransfers {
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
         redirectTo: ['Products'],
     }, 

    {
        path : '/products',
        name : 'Products',
        component : AdminProductsProducts
    },

    {
        path : '/collections',
        name : 'Collections',
        component : AdminProductsCollections
    },

    {
        path : '/transfers',
        name : 'Transfers',
        component : AdminProductsTransfers
    },

])
export class AdminProducts {
}
