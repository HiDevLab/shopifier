import 'rxjs/Rx';

import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, 
        Validators, Control, ControlGroup } from 'angular2/common';
import { Component, Pipe } from 'angular2/core';
import { Http } from 'angular2/http'
import { Router, RouteParams, RouteConfig,
    ROUTER_DIRECTIVES } from 'angular2/router';

import { Admin } from './admin';
import { BaseForm } from './admin.baseform'
import { AdminAuthService, AdminUtils } from './admin.auth'
import { 
    Autosize, Popover, ArrayLengthPipe, AdminLeavePage, AdminTagsEdit
} from './components';


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

    constructor(http, formbuilder, router, auth, admin, utils, routeparams) {
        super(http, formbuilder, router, auth, admin, utils);
    }

    ngOnInit() {
        this._admin.currentUrl();
        this._admin.headerButtons = [];

        this._admin.headerButtons.push({
            'text': 'Export', 'class': 'btn ml10 mr10',
            'click': this.onExport, 'self': this
        });
        this._admin.headerButtons.push ({
            'text': 'Import customers', 'class': 'btn mr10', 
            'click': this.onImport, 'self': this 
        });
        this._admin.headerButtons.push({
            'text': 'Add customer', 'class': 'btn btn-blue',
            'click': this.onAdd, 'self': this 
        });

        this.getPagination('/admin/customers/count.json',
                            '/admin/customers.json',
                            'getCustomers');
        this.getAPIData(['/admin/customers.json'], ['getCustomers']);
    }

    getCustomers(data) {
        this.customers = data.customers;
    }

    getPaginationAfter() {
        if (this.last_page == 1)
            return;

        this._admin.headerButtons.unshift({
            'text': '', 'class': 'btn mr30 fa fa-chevron-right',
            'click': this.onNextPage, 
            'self': this, 'disabled' : 'disabledNextPage' 
        });
        this._admin.headerButtons.unshift({
            'text': '', 'class': 'btn mr10 fa fa-chevron-left',
            'click': this.onPrevPage, 'self': this,
            'disabled' : 'disabledPrevPage'
        });
    }

    onAdd(self) {
        self._router.navigate(['NewCustomer']);
    }
    
    onEditCustomer(customer) {
        this.current_customer_index = this.customers.indexOf(customer);
        let link = ['EditCustomer', {'id': customer.id }];
        this._router.navigate(link);
    }
}


//------------------------------------------------------------------------------CustomersNew 
@Component({
  selector: 'main',
  templateUrl : 'templates/customer/new.html',
  directives: [FORM_DIRECTIVES, Autosize],
  pipes: [ProvincePipe, ArrayLengthPipe]
})
export class CustomersNew extends BaseForm {
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
        this._admin.currentUrl({ 'url':'#', 'text': 'Add customer'}, 1);

        this._admin.headerButtons = [];
        this._admin.headerButtons.push({
            'text': 'Cancel', 'class': 'btn mr10', 
            'click': this.onCancel, 'self': this 
        });
        this._admin.headerButtons.push ({
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
            this.formChange = true;
            this._admin.notNavigate = true;
        }
    }

    onKeyUpTag(event) {
        if (event.code == 'Backspace' && this.tag.length < 1 ) {
            this.tags.pop();
        }
    }

    addTag(tag) {
        this.tags.push(tag);
        this.formChange = true;
        this._admin.notNavigate = true;
    }

    onSave(self) {
        self = self || this;

        if(!self.groupValidate(self.form, 'customer')) return;
        let customer = {};
        customer['customer'] = self.form['customer'].value;
        customer.customer.tags = self.tags;

        self._http
            .post('/admin/customers.json', customer )
            .subscribe(
                (data) => self.saveAddress(data),
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
            .subscribe(
                (data) => this.setDefaultAddress(customer, data),
                (err) => {
                    this.apiErrors(this.form, 'default_address', err.json());
                },
            );
    }

    setDefaultAddress(customer, address) {
        let c_id = customer.customer.id;
        let a_id = address.customer_address.id;
        this._http
            .put(`/admin/customers/${c_id}/addresses/${a_id}/default.json`)
            .subscribe(
                (data) => {
                    let link = ['EditCustomer', {'id': customer.customer.id }];
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


//------------------------------------------------------------------------------CustomersEdit
@Component({
    selector: 'main',
    templateUrl : 'templates/customer/edit.html',
    directives: [
        FORM_DIRECTIVES, Autosize, Popover, AdminTagsEdit, AdminLeavePage
    ],
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
        this.object_id = this._routeParams.get('id');
        this.model = 'customer';
        this.currentLink = 'EditCustomer';
    }

    ngOnInit() {
        this.self = this; // for child components
        this._admin.notNavigate = false;
        this._admin.currentUrl({'url': '#', 'text': ''}, 1);

        this._admin.headerButtons = [];
        this._admin.headerButtons.push({
            'text': '', 'class': 'btn mr10 fa fa-chevron-left',
            'click': this.onPrev, 'self': this, 'disabled' : 'disabledPrev'
        });

        this._admin.headerButtons.push({
            'text': '', 'class': 'btn mr10 fa fa-chevron-right', 
            'click': this.onNext, 'self': this, 'disabled' : 'disabledNext'
        });

        this._admin.headerButtons.push({
            'text': 'Save', 'class': 'btn btn-blue', 
            'click': this.onSaveNote, 'primary': true, 'self': this 
        });

        this.addForm(this.form,
                    `/admin/customers/${this.object_id}.json`, 'customer');
    }

    addFormAfter() {
        this.getAPIData([`/admin/customers/${this.object_id}.json`,
            '/admin/customers/tags.json'],
            ['getCustomerAfter', 'getTagsAfter']
        );
    }

    getCustomerAfter(data) {
        this.object_id = data.customer.id;
        this.api_data = data;
        this.tags = this.api_data.customer.tags; //for child
        this.setDataToControls(this.form, 'customer', this.api_data.customer);

        let customer = this.api_data.customer;
        this._admin.currentUrl({
            'url': '#', 'text': `${customer.first_name} ${customer.last_name}`
        }, 1);

        this.disabledNext = undefined;
        this.disabledPrev = undefined;
    }

    getTagsAfter(data) {
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
            .patch(`/admin/customers/${self.object_id}.json`, customer)
            .subscribe(
                (data) => {
                    self.getCustomerAfter(data);
                    self.getAPIData(['/admin/customers/tags.json'],
                                    ['getTagsAfter']);
                },
                (err) => self.apiErrors(self.form, 'customer', err.json()),
            );
            self.formChange = false;
            self._admin.notNavigate = false;
    }

    saveTags(self) {
        let customer = {'customer': {'tags':self.tags}};
        self._http
            .patch(`/admin/customers/${self.object_id}.json`, customer)
            .subscribe(
                (data) => { 
                    self.getCustomerAfter(data);
                    self.getAPIData(['/admin/customers/tags.json'],
                                    ['getTagsAfter']);
                },
                (err) => self.apiErrors(self.form, 'customer', err.json()),
            );
        self.formChange = false;
        self._admin.notNavigate = false;
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
            .patch(`/admin/customers/${this.object_id}.json`, customer)
            .subscribe(
                (data) => {
                    this.getCustomerAfter(data);
                    this.showEdit = false;
                },
                (err) => self.apiErrors(self.form, 'customer', err.json()),
            );
    }

    changePopover(event, display) {
        let popover = document.querySelector('#address-popover');
        popover.classList.remove(display=='show' ? 'hide' : 'show');
        popover.classList.add(display=='show' ? 'show' : 'hide');
    }

    switchPopover() {
        let popover = document.querySelector('#address-popover');
        let show = popover.classList.contains('hide');
        popover.classList.remove(show ? 'hide' : 'show');
        popover.classList.add(show ? 'show' : 'hide');
        if (show) {
            let event = new Event('show');
            popover.dispatchEvent(event);
        }
    }


    onChangeAddress(event) {
        this.switchPopover();
    }

    onEditAddress(event, address) {
        this.current_address = address || {};
        this.setDataToControls(this.form, 'default_address',
                               this.current_address
        );
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

        let url = `/admin/customers/${this.object_id}/addresses.json`;
        let method = 'Post';

        let c_id = this.object_id;
        let a_id = this.current_address.id;
        if (this.current_address.id) { 
            url = `/admin/customers/${c_id}/addresses/${a_id}.json`;
            method = 'Patch';
        }

        this._http
            .request(method, url, address)
            .subscribe(
                () => {
                    this.addFormAfter();
                    this.showEditAddress = false;
                },
                (err) => self.apiErrors(self.form, 'customer', err.json()),
            );
    }

    onSelectAddress(event, address) {
        this.changePopover(event, 'hide');
        let c_id = this.object_id;
        let a_id = address.id;
        
        this._http
            .put(`/admin/customers/${c_id}/addresses/${a_id}/default.json`)
            .subscribe(
                () => { 
                    this.addFormAfter();
                    this.showEditAddress = false;
                },
                (err) => self.apiErrors(self.form, 'customer', err.json()),
            );
    }

    onDeleteAddress() {
        let c_id = this.object_id;
        let a_id = this.current_address.id;
        this._http
            .delete(`/admin/customers/${c_id}/addresses/${a_id}.json`)
            .subscribe(
                () => {
                    this.addFormAfter();
                    this.showEditAddress = false;
                },
                (err) => self.apiErrors(self.form, 'customer', err.json()),
            );
    }

    onDeleteCustomer() {
        let url = `/admin/customers/${this.object_id}.json`;
        this._http
            .delete(url)
            .subscribe(
                () => this._router.navigate(['Customers']),
                (err) => self.apiErrors(self.form, 'customer', err.json()),
            );
    }
}
