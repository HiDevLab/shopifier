import 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';

import { FormBuilder, Validators, FormControl, ControlGroup } from '@angular/forms';
import { Http } from '@angular/http';
import { Router, Routes } from '@angular/router';

import { Admin } from './admin';
import { AdminAuthService, AdminUtils } from './admin.auth';
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
        this.now = new Date;
    }

    addForm(form, url, alias) {
        this._http
            .options(url)
            .subscribe(
                data => {
                    this.addFormFromOptinons(form, data, alias);
                    if (this.addFormAfter) this.addFormAfter();
                },
                err => {
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

        let control = new FormControl('', Validators.compose(validators));

        if (group[ctrl_name].type==='choice'){
            form[group_name + '_meta'][ctrl_name].choices =
                                                group[ctrl_name].choices;
            control.setValue(group[ctrl_name].choices[0].value);
        }
        if (group[ctrl_name].type==='boolean') control.setValue(false);
        if (group[ctrl_name].type==='datetime') control.setValue(undefined);
        if (group[ctrl_name].type==='list') control.setValue([]);

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
                    (data) => { 
                        this[afters[i]](data);
                        if (i === (urls.length - 1) && this.AfterViewInit) {
                            setTimeout(() => this.AfterViewInit(), 100);
                        }
                    },
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

    getAPI(url, after) {
        this._http.get(url)
            .subscribe(
                (data) => after(data),
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

    getAPIDataAll(urls, afters) {
        let _urls = [];
        for(let i=0; i < urls.length; i++) {
            _urls.push(this._http.get(urls[i]));
        }
        Observable.forkJoin(_urls).subscribe(
            data => {
                for(let i=0; i < urls.length; i++) {
                    this[afters[i]](data[i]);
                }
                if (this.AfterViewInit) {
                    setTimeout(() => this.AfterViewInit(), 100);
                }
            },
            err => {
                this.obj_errors = err;
                try {
                    this.errors = this._utils.to_array(err.json());
                } catch(e) {
                    console.log(err, e);
                }
            }
        );
    }


    setDataToControls(form, group_name, obj) {
        let group = form[group_name];
        let meta = form[group_name + '_meta'];

        let keys = Object.keys(group.controls);
        for (let i=0; i < keys.length; i++) {
            let ctrl = keys[i];
            let control = group.controls[ctrl];
            if (obj[ctrl])
                control.setValue(obj[ctrl]);
            else {
                control.setValue(undefined);
                if (meta[ctrl].type==='choice')
                    control.setValue(meta[ctrl].choices[0].value);
                if (meta[ctrl].type==='boolean')
                    control.setValue(false);
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


    // for EditForm
    onNext(){ // call from admin header
        let id = this.object_id;
        this._http
            .get(`/admin/${this.model}s.json?since_id=${id}&limit=1&fields=id`)
            .subscribe(
                (data) => { 
                    if (data[`${this.model}s`].length) {
                        this._router.navigate([self.currentLink, data[`${this.model}s`][0].id]);
                        this.disabledPrev = false;
                        this.disabledNext = false;
                    }
                    else {
                       this.disabledNext = true;
                    }
                },
                (err) =>  this.disabledNext = true,
            );
    }
    // for EditForm
    onPrev(){ // call from admin header
        let id = this.object_id;
        this._http
            .get(`/admin/${this.model}s.json?before_id=${id}&limit=1&fields=id`)
            .subscribe(
                (data) => {
                    if (data[`${this.model}s`].length) {
                        self._router.navigate([self.currentLink, data[`${this.model}s`][0].id]);
                        self.disabledNext = false;
                        self.disabledPrev = false;
                    }
                    else {
                       this.disabledPrev = true;
                    }
                },
                (err) => this.disabledPrev = undefined,
            );
    }

    DOMElement(selector) {
        let el = document.querySelector(selector);
        return el;
    }

    getByID(id) {
        return document.querySelector(`[id='${id}']`);
    }

    isIndex(x) {
        let n = Number(x);
        return Number.isInteger(n) && n > -1;
    }

    findIndex(container, parameter, value) {
        return container.findIndex((element) => {
            return element[parameter] == value;
        });
    }

    find(container, parameter, value) {
        for (let item of container) {
            if (item[parameter] == value) {
                return item;
            }
        }
        return undefined;
    }

    splice(container, parameter, value, count) {
        let index = this.findIndex(container, parameter, value);
        if (this.isIndex(index)){
            container.splice(index, count || 1);
        }
    }

    onCancel() {
        this._router.navigate([this.cancelLink]);
    }

}
