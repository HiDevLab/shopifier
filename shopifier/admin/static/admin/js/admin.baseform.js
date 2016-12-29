import 'rxjs/Rx';

import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, 
        Validators, Control, ControlGroup } from 'angular2/common';
import { Component, Pipe } from 'angular2/core';
import { Http } from 'angular2/http'
import { Router, RouteParams, RouteConfig,
    ROUTER_DIRECTIVES } from 'angular2/router';

import { Admin } from './admin';
import { AdminAuthService, AdminUtils } from './admin.auth'
import { 
    Autosize, Popover, ArrayLengthPipe, AdminLeavePage, AdminTagsEdit
} from './components';


//----------------------------------------------------------------------BaseForm
export class BaseForm {
    errors = [];
    obj_errors = {};
    api_data = {}
    form = {};    //tree controls
    formChange = false;
    canDeactivate = undefined;

    object_id = undefined; // id the main instance (customer, product ...)
    model = ''; // the name of model

    constructor(http, formbuilder, router, auth, admin, utils) {
        this._http = http;
        this._router = router;
        this._admin = admin;
        this._auth = auth;
        this._utils = utils;
        this._formbuilder = formbuilder;
    }

    addForm(form, url, alias) {
        this._http
            .options(url)
            .subscribe(
                (data) => {
                    this.addFormFromOptinons(form, data, alias);
                    if (this.addFormAfter) this.addFormAfter();
                },
                (err) => {
                    this.obj_errors = err; 
//                     this.errors = this._utils.to_array(err.json());
                },
            );
    }

    addFormFromOptinons(form, data, alias) {
        if (data.actions) {
            let group = data.actions[Object.keys(data.actions)[0]];
            this.addGroup(form, group, alias);
        }
    }

    addGroup(form, group, group_name) {
        if (Object.prototype.toString.call(group) !== '[object Object]')
            return;
        form[group_name] = this._formbuilder.group({});
        form[group_name + '_meta'] = {};
        
        let keys = Object.keys(group);

        for (let i=0; i < keys.length; i++) {
            let ctrl = keys[i];
            if ('children' in group[ctrl])
                this.addGroup(form, group[ctrl].children, ctrl);
            else
                this.addControl(form, group, group_name, ctrl);
        }
    }

    addControl(form, group, group_name, ctrl_name) {
        if (group[ctrl_name].read_only) 
            return;

        let validators = [];
        if (group[ctrl_name].required)
            validators.push(Validators.required);

        if (group[ctrl_name].type==='email')
            validators.push(this.emailValidator);

        if (group[ctrl_name].max_length)
            validators.push(Validators.maxLength(group[ctrl_name].max_length));

        if (group[ctrl_name].min_length)
            validators.push(Validators.minLength(group[ctrl_name].min_length));

        form[group_name + '_meta'][ctrl_name] = {
            'label': group[ctrl_name].label
        };
        form[group_name + '_meta'][ctrl_name].type = group[ctrl_name].type;

        let control = new Control('', Validators.compose(validators));

        if (group[ctrl_name].type==='choice'){
            form[group_name + '_meta'][ctrl_name].choices =
                                                group[ctrl_name].choices;
            control.updateValue(group[ctrl_name].choices[0].value);
        }
        if (group[ctrl_name].type==='boolean') control.updateValue(false);
        if (group[ctrl_name].type==='datetime') control.updateValue(undefined);
        if (group[ctrl_name].type==='list') control.updateValue([]);

        form[group_name].addControl(ctrl_name, control);
    }

    emailValidator(control) {
        if (!control.value)
            return {'Invalid Email Address': true};
        if (control.value
                    .match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            return null;
        }
        else {
            return {'Invalid Email Address': true};
        }
    }

    groupValidate (form, group_name) {
        let keys = Object.keys(form[group_name].controls);
        this.obj_errors = {};
        this.errors = [];
        for (let i=0; i < keys.length; i++) {
            let ctrl = keys[i];
            if (!form[group_name].controls[ctrl].valid) {
                this.obj_errors[ctrl] = true;
                let err1 = form[group_name + '_meta'][ctrl].label;
                let err2 = Object.keys(form[group_name]
                                .controls[ctrl].errors)[0];
                this.errors.push(`${err1}: ${err2}`); 
                form[group_name + '_meta'][ctrl].error = true;
            }
            else {
                form[group_name + '_meta'][ctrl].error = false;
            }
        }
        return form[group_name].valid;
    }

    clsErrors(form, group_name) {
        this.obj_errors = {};
        this.errors = [];
        let keys = Object.keys(form[group_name + '_meta']);
        for (let i=0; i < keys.length; i++) {
            let ctrl = keys[i];
            form[group_name + '_meta'][ctrl].error = false;
        }
    }

    apiErrors(form, group_name, errors) {
        let keys = Object.keys(errors);
        this.obj_errors = {};
        this.errors = [];

        for (let i=0; i < keys.length; i++) {
            let ctrl = keys[i];
            for (let j in errors[ctrl]) {
                this.obj_errors[ctrl] = true;
                let err1 = form[group_name + '_meta'][ctrl].label;
                let err2 = errors[ctrl][j];
                this.errors.push(`${err1}: ${err2}`);
                form[group_name + '_meta'][ctrl].error = true;
            }
        }
    }

    getAPIData(urls, afters) {
        for(let i=0; i < urls.length; i++) {
            this._http
                .get(urls[i])
                .subscribe(
                    (data) => this[afters[i]](data),
                    (err) => {
                        this.obj_errors = err;
                        try {
                            this.errors = this._utils.to_array(err.json());
                        } catch(e) {
                            console.log(err, e);
                        }
                    },
                );
        }
    }

    setDataToControls(form, group_name, obj) {
        let group = form[group_name];
        let meta = form[group_name + '_meta'];

        let keys = Object.keys(group.controls);
        for (let i=0; i < keys.length; i++) {
            let ctrl = keys[i];
            let control = group.controls[ctrl];
            if (obj[ctrl])
                control.updateValue(obj[ctrl]);
            else {
                control.updateValue(undefined);
                if (meta[ctrl].type==='choice')
                    control.updateValue(meta[ctrl].choices[0].value);
                if (meta[ctrl].type==='boolean')
                    control.updateValue(false);
            }
        }
    }

    getPagination(count_url, list_url, after) {
        this.list_url = list_url;
        this.list_func_after = [after];
        this._http
            .get(count_url)
            .subscribe(
                (data) => {
                    this.count_list = data.count;
                    this.current_page = 1;
                    this.last_page = Math.ceil(this.count_list / 4); //50
                    this.disabledPrevPage = true;
                    this.disabledNextPage = 
                        !(this.current_page < this.last_page);
                    if (this.getPaginationAfter)
                        this.getPaginationAfter();
                },
                (err) => this.obj_errors = err,
            ); 
    }

    // for ListForm
    onNextPage(self){ //call from admin header 
        self = self || this;
        if (self.current_page == self.last_page) return;
        self.current_page++;
        let urls = [`${self.list_url}?page=${self.current_page}`,];
        self.getAPIData(urls, self.list_func_after);
        self.disabledNextPage = !(self.current_page < self.last_page);
        self.disabledPrevPage = !(self.current_page > 1);
    }
    // for ListForm
    onPrevPage(self){ //call from admin header
        self = self || this;
        if (self.current_page == 1) return;
        self.current_page--;
        let urls = [`${self.list_url}?page=${self.current_page}`,];
        self.getAPIData(urls, self.list_func_after);
        self.disabledNextPage = !(self.current_page < self.last_page);
        self.disabledPrevPage = !(self.current_page > 1);
    }

    onFormChange(self) {
        self = self || this;
        self._admin.notNavigate = true;
        self.formChange = true;
    }

    routerCanDeactivate(prev, next) {
        if (!this.formChange) {
            return true;
        }
        this.showLeavePageDialog = true;
        this.canDeactivate = new Promise(
            (resolve, reject) => {
                this.unloadPage = resolve;
            }
        );
        return this.canDeactivate;
    }

    // for EditForm
    onNext(self){ // call from admin header
        self = self || this;
        let id = self.object_id;
        self._http
            .get(`/admin/${self.model}s.json?since_id=${id}&limit=1&fields=id`)
            .subscribe(
                (data) => { 
                    if (data[`${self.model}s`].length) {
                        self._router.navigate([self.currentLink,
                            {'id': data[`${self.model}s`][0].id }]);
                        self.disabledPrev = false;
                        self.disabledNext = false;
                    }
                    else {
                       self.disabledNext = true;
                    }
                },
                (err) =>  self.disabledNext = true,
            );
    }
    // for EditForm
    onPrev(self){ // call from admin header
        self = self || this;
        let id = self.object_id;
        self._http
            .get(`/admin/${self.model}s.json?before_id=${id}&limit=1&fields=id`)
            .subscribe(
                (data) => {
                    if (data[`${self.model}s`].length) {
                        self._router.navigate([self.currentLink,
                            {'id': data[`${self.model}s`][0].id }]);
                        self.disabledNext = false;
                        self.disabledPrev = false;
                    }
                    else {
                       self.disabledPrev = true;
                    }
                },
                (err) => self.disabledPrev = undefined,
            );
    }

    DOMElement(selector) {
        return window.document.querySelector(selector);
    }

    // find instance in collection by id
    findObject(object, collection) {
        for (let i=0; i < collection.length; i++) {
            if (object.id === collection[i].id) {
                return collection[i];
            }
        }
        return undefined;
    }

    isIndex(x) {
        x = Number(x);
        return Number.isInteger(x) && x > -1;
    }

}
