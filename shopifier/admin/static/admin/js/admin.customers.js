import { Component, DynamicComponentLoader, ViewContainerRef } from 'angular2/core';
import { Router, RouteParams, RouteConfig, ROUTER_DIRECTIVES,  } from 'angular2/router'
import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, Validators, Control, ControlGroup } from 'angular2/common';
import { Http } from 'angular2/http'
import 'rxjs/Rx'

import { AdminAuthService, AdminUtils } from './admin.auth'
import { Admin } from './admin'


//------------------------------------------------------------------------------ 
export class BaseForm {
    errors = [];
    obj_errors = {};
    api_data = {}

    form = {};    //tree controls

    formChange = false;
    
    constructor(http, formbuilder, router, auth, admin, utils) {
        this._http = http;
        this._router = router;
        this._admin = admin;
        this._auth = auth;
        this._utils = utils;
        this._formbuilder = formbuilder;
    }
    
    getAPIData(get_api_data_url){
        this._http
            .get(get_api_data_url)
            .subscribe( data => this.onBaseInit(data),
                        err => {
                                    this.obj_errors = err; 
                                    this.errors = this._utils.to_array(err.json()); 
                                }, 
                       ); 
    }
    
    onBaseInit(data) {
        if (this.beforeInit) this.beforeInit(data);// define on the child
        this.api_data = data;
        if (this.afterInit) this.afterInit(data);// define on the child
    }
    
    addForm(set_data) {
        let keys = Object.keys(this.api_data);
        for (let i in keys) {
            let group_name = keys[i];
            this.addGroup(this.api_data[group_name], group_name, set_data);
        }
    }
    
    addGroup(group, group_name, set_data) {
        if (Object.prototype.toString.call(group) !== '[object Object]')
            return;
        this.form[group_name] = this._formbuilder.group({});
        let keys = Object.keys(group);
        
        for (let i in keys) {
            let ctrl = keys[i];
            if (Object.prototype.toString.call(group[ctrl]) === '[object Object]') {
                this.addGroup(group[ctrl], ctrl, set_data);
            }
            if (Object.prototype.toString.call(group[ctrl]) !== '[object Array]'){
                let control = new Control('');
                if (set_data)
                    control.updateValue(group[ctrl], true, true);
                this.form[group_name].addControl(ctrl, control);
            }
        }
        
    }
    onChanges(changes) {
        console.log(changes);
    }

}


//------------------------------------------------------------------------------ 
@Component({
  selector: 'main',
  templateUrl : 'templates/customer/new.html',
  directives: [FORM_DIRECTIVES],
  main_request : 'hhh'
})
export class CustomersNew extends BaseForm{
    get_object = 'customer';
    put_object = 'customer';
    get_api_data_url = '/admin/customers/1.json';
    
    
    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService], [Admin], [AdminUtils]];
    }
    constructor(http, formbuilder, router, auth, admin, utils) {
        super(http, formbuilder, router, auth, admin, utils);
    }
    
    ngOnInit() {
        this._admin.currentUrl({ 'url':'#', 'text': 'Add customer'});
        
        this._admin.headerButtons = [];
        this._admin.headerButtons.push(
            {
                'text': 'Cancel', 'class': 'btn mr10', 
                'click': this.onCancel, 'self': this 
            });
        this._admin.headerButtons.push(
            {
                'text': 'Save customer', 'class': 'btn btn-blue', 
                'click': this.onSave, 'primary': true, 'self': this 
            });
    
        this.getAPIData(this.get_api_data_url);
    }
    
    afterInit(){
        this.addForm(true);
        console.log(this.form);
    }
}


//------------------------------------------------------------------------------ 
@Component({
  selector: 'main',
  templateUrl: 'templates/customer/customers.html',
  directives: [FORM_DIRECTIVES],
})
export class Customers {
    static get parameters() {
        return [[Http], [Router], [AdminAuthService], [Admin], [AdminUtils]];
    }
    constructor(http, router, auth, admin, utils ) {
        this._http = http;
        this._router = router;
        this._admin = admin;
        this._auth = auth;
        this._utils = utils;
    }
    
    ngOnInit() {
        this._admin.headerButtons = [];
        this._admin.headerButtons.push(
            {
                'text': 'Export', 'class': 'btn mr10', 
                'click': this.onExport, 'self': this 
            });
        this._admin.headerButtons.push(
            {
                'text': 'Import customers', 'class': 'btn mr10', 
                'click': this.onImport, 'self': this 
            });
        this._admin.headerButtons.push(
            {
                'text': 'Add customer', 'class': 'btn btn-blue', 
                'click': this.onAdd, 'self': this 
            });
    }
    
    onAdd(self) {
        self._router.navigate(['NewCustomer'])
    }
}

