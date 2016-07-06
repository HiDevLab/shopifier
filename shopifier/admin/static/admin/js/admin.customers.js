import 'rxjs/Rx'

import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, 
        Validators, Control, ControlGroup } from 'angular2/common';
import { Component, Pipe } from 'angular2/core';
import { Http } from 'angular2/http'
import { Router, RouteParams, RouteConfig,
            ROUTER_DIRECTIVES } from 'angular2/router';

import { Admin } from './admin';
import { AdminAuthService, AdminUtils } from './admin.auth'
import { Autosize, Popover, ArrayLengthPipe,
            AdminTagsEdit } from './components';


@Pipe({
    name: 'province'
})
export class ProvincePipe{
    transform(regions, country) {
    return regions.filter((region) => {
        return region.value.substr(0, 2) === country;
    });
  }
}

//----------------------------------------------------------------------BaseForm
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

    addForm(form, url, alias) {
        this._http
            .options(url)
            .subscribe(
                (data) =>  {
                            this.addFormFromOptinons(form, data, alias);
                            if (this.addFormAfter) this.addFormAfter();
                },
                (err) => {
                            this.obj_errors = err; 
                            this.errors = this._utils.to_array(err.json()); 
                }, 
            );
    }
    
    addFormFromOptinons(form, data, alias) {
        let group = data.actions[Object.keys(data.actions)[0]];
        this.addGroup(form, group, alias);
    }
    
    addGroup(form, group, group_name) {
        if (Object.prototype.toString.call(group) !== '[object Object]')
            return;
        form[group_name] = this._formbuilder.group({});
        form[group_name + '_meta'] = {};
        
        let keys = Object.keys(group);
        
        for (let i in keys) {
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
        for (let i in keys) {
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
        for (let i in keys) {
            let ctrl = keys[i];
            form[group_name + '_meta'][ctrl].error = false;
        }
    }

    apiErrors(form, group_name, errors) {
        let keys = Object.keys(errors);
        this.obj_errors = {};
        this.errors = [];

        for (let i in keys) {
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
        for(let i in urls) {
            this._http
                .get(urls[i])
                .subscribe( (data) => this[afters[i]](data),
                            (err) => {
                                        this.obj_errors = err; 
                                        this.errors = this._utils
                                            .to_array(err.json());
                            },
                );
        }
    }

    setDataToControls(form, group_name, obj) {
        let group = form[group_name];
        let meta = form[group_name + '_meta'];
        
        let keys = Object.keys(group.controls);
        for (let i in keys) {
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

    getPagination(count_url, list_url) {
        this.list_url = list_url;
        this._http
            .get(count_url)
            .subscribe((data) => {
                        this.count_list = data.count;
                        this.current_page = 1;
                        this.last_page = Math.ceil(this.count_list / 4); //50
                        this.disabledPrevPage = true;
                        this.disabledNextPage = 
                            !(this.current_page < this.last_page);
                        if (this.getPaginationAfter)
                            this.getPaginationAfter();

                        },
                        err => this.obj_errors = err, 
            ); 
    }
    
    onNextPage(self){ //call from admin header 
        if (self.current_page == self.last_page) return;
        self = self || this;
        self.current_page++;
        self.getAPIData(`${self.list_url}?page=${self.current_page}`);
        self.disabledNextPage = !(self.current_page < self.last_page);
        self.disabledPrevPage = !(self.current_page > 1);
    }

    onPrevPage(self){ //call from admin header
        if (self.current_page == 1) return;
        self = self || this;
        self.current_page--;
        self.getAPIData(`${self.list_url}?page=${self.current_page}`);
        self.disabledNextPage = !(self.current_page < self.last_page);
        self.disabledPrevPage = !(self.current_page > 1);
    }
}


//---------------------------------------------------------------------Customers
@Component({
  selector: 'main',
  templateUrl: 'templates/customer/customers.html',
  directives: [FORM_DIRECTIVES],
})
export class Customers extends BaseForm {
    
    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService], 
                [Admin], [AdminUtils]];
    }

    constructor(http, formbuilder, router, auth, admin, utils, routeparams){
        super(http, formbuilder, router, auth, admin, utils);
    }

    ngOnInit() {
        this._admin.currentUrl();
        this._admin.headerButtons = [];

        this._admin.headerButtons.push(
            {
                'text': 'Export', 'class': 'btn ml10 mr10', 
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

        this.getPagination('/admin/customers/count.json',
                            '/admin/customers.json');
        this.getAPIData(['/admin/customers.json'], ['getCustomers']);
        
    }
    
    getCustomers(data) {
        this.customers = data.customers;
    }
    
    getPaginationAfter() {
        if (this.last_page == 1)
            return;
            
        this._admin.headerButtons.unshift(
            {
                'text': '', 'class': 'btn mr30 fa fa-chevron-right', 
                'click': this.onNextPage, 
                'self': this, 'disabled' : 'disabledNextPage' 
            });
        this._admin.headerButtons.unshift(
            {
                'text': '', 'class': 'btn mr10 fa fa-chevron-left', 
                'click': this.onPrevPage, 'self': this,
                'disabled' : 'disabledPrevPage' 
            });
    }

    onAdd(self) {
        self._router.navigate(['NewCustomer'])
    }
    
    onEditCustomer(customer) {
        this.current_customer_index = this.customers.indexOf(customer); 
        let link = ['EditCustomer', {'id': customer.id }];
        this._router.navigate(link);
    }
}



//-----------------------------------------------------------------CustomersNew 
@Component({
  selector: 'main',
  templateUrl : 'templates/customer/new.html',
  directives: [FORM_DIRECTIVES, Autosize],
  pipes: [ProvincePipe, ArrayLengthPipe]
})
export class CustomersNew extends BaseForm{
    tags = [];
    all_tags = [];

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService],
            [Admin], [AdminUtils]];
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
        this.addForm(this.form, '/admin/customers.json', 'customer');
        this.getAPIData(['/admin/customers/tags.json'], ['getTagsAfter']);
    }

    getTagsAfter(data){
        this.all_tags_statistic = data.tags;
        this.all_tags = [];
        for (let i in data.tags) {
            this.all_tags.push(data.tags[i][0]);
        }
        this.tags = [];
        this.tag = '';
    }

    deleteTag(i) {
        let ret = this.all_tags.indexOf(this.tags[i]);
        if (ret < 0 ) {
            this.all_tags.push(this.tags[i]);
        }
        this.tags.splice(i, 1);
    }

    changeTag() {
        if (this.tag) {
            if (this.tags.indexOf(this.tag) > -1 ) {
                this.tooltipError = true;
                let self = this;
                setTimeout(()=> { self.tooltipError = false; }, 5000);
                return;
            }
            this.tags.push(this.tag.trim());
            this.tag = '';
            this.tooltipError = false;
            this.formChange=true;
        }
    }

    onKeyUpTag(event) {
        if (event.code == 'Backspace' && this.tag.length < 1 ) {
            this.tags.pop();
        }
    }

    addTag(tag) {
        this.tags.push(tag);
        this.formChange=true;
    }

    onSave(self) {
        self = self || this;

        if(!self.groupValidate(self.form, 'customer')) return;
        let customer = {};
        customer['customer'] = self.form['customer'].value;
        customer.customer.tags = self.tags;

        self._http
            .post('/admin/customers.json', customer )
            .subscribe((data) => self.saveAddress(data),
                       (err) => {
                            self.apiErrors(self.form, 'customer', err.json());
                       },
            );
    }

    saveAddress(customer) {
        let address = {};
        address['address'] = this.form.default_address.value;
        if (!address.address.first_name)
            address.address.first_name = this.form.customer
                                                .controls.first_name.value;
        if (!address.address.last_name)
            address.address.last_name = this.form.customer
                                                    .controls.last_name.value;
        let url = `/admin/customers/${customer.customer.id}/addresses.json`;
        this._http
            .post(url, address )
            .subscribe((data) => this.setDefaultAddress(customer, data),
                       (err) => { 
                            this.apiErrors(
                                this.form, 'default_address', err.json()
                            );
                        }, 
            );
    }

    setDefaultAddress(customer, address) {
        let c_id = customer.customer.id;
        let a_id = address.customer_address.id;
        this._http
            .put(`/admin/customers/${c_id}/addresses/${a_id}/default.json`)
            .subscribe((data) => {
                    let link = ['EditCustomer',
                                {'id': customer.customer.id }];
                    this._router.navigate(link);
                },
                (err) => { 
                    this.apiErrors(this.form, 'default_address' ,err.json());
                }, 
            );
    }

    onCancel(self) {
        self = self || this;
        self._router.navigate(['Customers']);
    }
}


//------------------------------------------------------------------------------------------------------------------------------------------------------------CustomersEdit 
@Component({
  selector: 'main',
  templateUrl : 'templates/customer/edit.html',
  directives: [FORM_DIRECTIVES, Autosize, Popover, AdminTagsEdit],
  pipes: [ProvincePipe]
})
export class CustomersEdit extends BaseForm{
    
    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService], 
                [Admin], [AdminUtils], [RouteParams]];
    }
    constructor(http, formbuilder, router, auth, admin, utils, routeparams) {
        super(http, formbuilder, router, auth, admin, utils);
        this._routeParams = routeparams;
        this.customer_id = this._routeParams.get('id');
    }
    
    ngOnInit() {
        this.self = this; // for child components

        this._admin.headerButtons = [];
        this._admin.headerButtons.push(
            {
                'text': '', 'class': 'btn mr10 fa fa-chevron-left', 
                'click': this.onPrev, 'self': this, 'disabled' : 'disabledPrev' 
            });
        this._admin.headerButtons.push(
            {
                'text': '', 'class': 'btn mr10 fa fa-chevron-right', 
                'click': this.onNext, 'self': this, 'disabled' : 'disabledNext'
            });
        this._admin.headerButtons.push(
            {
                'text': 'Save', 'class': 'btn btn-blue', 
                'click': this.onSaveNote, 'primary': true, 'self': this 
            });
        this.addForm(this.form, `/admin/customers/${this.customer_id}.json`, 'customer');
    }
    
    onNext(self){ // call from admin header
        self = self || this;
        let url = `/admin/customers.json?since_id=${self.customer_id}&limit=1&fields=id`;
        self._http
            .get(url)
            .subscribe(data => { 
                            if (data.customers.length > 0) {  
                                self._router.navigate( ['EditCustomer', {'id': data.customers[0].id }]);
                                self.disabledPrev = false; 
                                self.disabledNext = false;
                            }
                            else {
                               self.disabledNext = true;
                            }
                        }, 
                        err =>  self.disabledNext = true, 
            ); 
    }
    
    onPrev(self){ // call from admin header
        self = self || this;
        let url = `/admin/customers.json?before_id=${self.customer_id}&limit=1&fields=id`;
        self._http
            .get(url)
            .subscribe(data => { 
                            if (data.customers.length > 0) { 
                                self._router.navigate( ['EditCustomer', {'id': data.customers[0].id }]);
                                self.disabledNext = false;
                                self.disabledPrev = false;
                            }
                            else {
                               self.disabledPrev = true;
                            }
                        }, 
                        err =>  self.disabledPrev = undefined, 
            ); 
    }
    
    addFormAfter() {
        this.getAPIData([`/admin/customers/${this.customer_id}.json`, '/admin/customers/tags.json'], 
        ['getCustomerAfter', 'getTagsAfter']);
    }
    
    getCustomerAfter(data) {
        this.customer_id = data.customer.id;
        this.api_data = data;
        this.tags = this.api_data.customer.tags; //for child
        this.setDataToControls(this.form, 'customer', this.api_data.customer);

        this._admin.currentUrl({
                'url':'#', 'text': `${this.api_data.customer.first_name} ${this.api_data.customer.last_name}`
                });
                
        this.disabledNext = undefined;
        this.disabledPrev = undefined;
    }

    getTagsAfter(data){
        this.all_tags_statistic = data.tags;//for child
        this.all_tags = [];
        for (let i in this.all_tags_statistic) {
            this.all_tags.push(this.all_tags_statistic[i][0]);
        }
    }

    onSaveNote(self) {
        self = self || this;
        let customer = {
            'customer': {
                'note':self.form.customer.controls.note.value,
                'tags':self.tags
            }
        };
        self._http
            .patch(`/admin/customers/${self.customer_id}.json`, customer )
            .subscribe( data => { 
                                    self.getCustomerAfter(data);
                                    self.getAPIData(['/admin/customers/tags.json'], 
                                                    ['getTagsAfter']);
                                },
                        err => self.apiErrors(self.form, 'customer', err.json()), 
            );
            self.formChange = false;
    }

    saveTags(self) {
        let customer = {
            'customer': {
                'tags':self.tags
            }
        };
        self._http
            .patch(`/admin/customers/${self.customer_id}.json`, customer )
            .subscribe( data => { 
                                    self.getCustomerAfter(data);
                                    self.getAPIData(['/admin/customers/tags.json'], 
                                                    ['getTagsAfter']);
                                },
                        err => self.apiErrors(self.form, 'customer', err.json()), 
            );
            self.formChange = false;
    }
    
    
    onEditCustomer() {
        this.clsErrors(this.form, 'customer');
        this.setDataToControls(this.form, 'customer', this.api_data.customer);
        this.showEdit = true;
        this.customerChange = false;
    }
    
    onSaveCustomer() {
        if(!this.groupValidate(this.form, 'customer')) return;

        let customer = {};
        customer['customer'] = this.form['customer'].value;
        this._http
            .patch(`/admin/customers/${this.customer_id}.json`, customer )
            .subscribe( data => { 
                                    this.getCustomerAfter(data);
                                    this.showEdit = false;
                                },
                        err => self.apiErrors(self.form, 'customer', err.json()), 
            );
    }

    changePopover(event, display) {
        //event.stopPropagation();
        let popover = document.querySelector('#address-popover');
        if (popover) {
            popover.classList.remove(display=='show' ? 'hide' : 'show');
            popover.classList.add(display=='show' ? 'show' : 'hide');
        }
    }
    
    onChangeAddress(event) {
        this.changePopover(event, 'show');
    }
    
    onEditAddress(event, address){
        this.current_address = address || {};
        //this.form.address = Object.assign({}, this.form.default_address); 
        this.setDataToControls(this.form, 'default_address', this.current_address);
        
        this.changePopover(event, 'hide');
        this.showEditAddress = true;
    }
    
    onSaveAddress(){
        if(!this.groupValidate(this.form, 'default_address')) return;

        let address = {};
        address['address'] = this.form['default_address'].value;
        if (!address.address.first_name)
            address.address.first_name = this.api_data.customer.first_name;
        if (!address.address.last_name)
            address.address.last_name = this.api_data.customer.last_name;
        
        let url = `/admin/customers/${this.customer_id}/addresses.json`;
        let method = 'Post';
        
        if (this.current_address.id) { 
            url = `/admin/customers/${this.customer_id}/addresses/${this.current_address.id}.json`;
            method = 'Patch';
        }
        
        this._http
            .request(method, url, address)
            .subscribe(()=> { 
                                this.addFormAfter();
                                this.showEditAddress = false;
                            },
                        err => self.apiErrors(self.form, 'customer', err.json()), 
            );
    }
    
    onSelectAddress(event, address) {
        this.changePopover(event, 'hide');
        let url = `/admin/customers/${this.customer_id}/addresses/${address.id}/default.json`;
        this._http
                .put(url)
                .subscribe(()=> { 
                                    this.addFormAfter();
                                    this.showEditAddress = false;
                                },
                            err => self.apiErrors(self.form, 'customer', err.json()), 
                );
    }
    
    onDeleteAddress() {
        let url = `/admin/customers/${this.customer_id}/addresses/${this.current_address.id}.json`;
        this._http
                .delete(url)
                .subscribe(()=> { 
                                    this.addFormAfter();
                                    this.showEditAddress = false;
                                },
                            err => self.apiErrors(self.form, 'customer', err.json()), 
                );
    }
    
    onDeleteCustomer() {
        let url = `/admin/customers/${this.customer_id}.json`;
        this._http
                .delete(url)
                .subscribe(()=> this._router.navigate(['Customers']),
                            err => self.apiErrors(self.form, 'customer', err.json()), 
                );
    }
}


