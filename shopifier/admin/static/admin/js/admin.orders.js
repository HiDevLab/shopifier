import 'rxjs/Rx';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
    Validators } from '@angular/forms';
import { Http } from '@angular/http';
import { NgModule, Component, Pipe, ViewContainerRef } from '@angular/core';
import { Router, Routes, ActivatedRoute } from '@angular/router';

import { Admin } from './admin'
import { AdminAuthService, AdminUtils } from './admin.auth'
import { BaseForm } from './admin.baseform';
import { AdminComponentsModule, AdminLeavePage } from './components';


//------------------------------------------------------------------------------AdminOrdersOrders
@Component({
    selector: 'main', templateUrl:
    'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminOrdersOrders {
    component = 'Orders';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl(); this._admin.headerButtons = [];}
}


//------------------------------------------------------------------------------AdminOrdersDrafts
@Component({
    selector: 'main',
    templateUrl: 'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminOrdersDrafts {
    component = 'Drafts';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl(); this._admin.headerButtons = [];}
}


//------------------------------------------------------------------------------AdminOrdersModule
@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule,
        AdminComponentsModule,
    ],
    providers: [
    ],
    declarations: [
        AdminOrdersDrafts,
        AdminOrdersOrders,
    ]
})
export class AdminOrdersModule {}
