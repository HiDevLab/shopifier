import 'rxjs/Rx';

import { CommonModule } from '@angular/common';
import { NgModule, Component, Pipe, ViewContainerRef } from '@angular/core';
import { Http } from '@angular/http';
import { Router, Routes, ActivatedRoute, RouteParams } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
    Validators } from '@angular/forms';

import { AdminAuthService, AdminUtils } from './admin.auth';
import { Admin } from './admin';
import { BaseForm } from './admin.baseform';
import { AdminComponentsModule, Autosize, Popover, ArrayLengthPipe,
    AdminLeavePage, AdminTagsEdit } from './components';


@Pipe({
    name: 'province'
})
export class ProvincePipe {
    transform(regions, country) {
    return regions.filter((region) => {
        return region.value.substr(0, 2) === country;
    });
  }
}

//------------------------------------------------------------------------------AdminCustomers
@Component({
  selector: 'main',
  templateUrl: 'templates/customer/customers.html',
})
export class AdminCustomers extends BaseForm {

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService], [Admin], [AdminUtils]];
    }

    constructor(http, fb, router, auth, admin, utils, routeparams) {
        super(http, fb, router, auth, admin, utils);
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
        if (this.last_page === 1)
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

    onAdd() {
        this._router.navigate(['/customers/new']);
    }
    
    onEditCustomer(customer) {
        this.current_customer_index = this.customers.indexOf(customer);
        let link = ['/customers/', customer.id];
        this._router.navigate(link);
    }
}


//------------------------------------------------------------------------------AdminCustomersNew 
@Component({
  selector: 'main',
  templateUrl : 'templates/customer/new.html',
  pipes: [ProvincePipe, ArrayLengthPipe]
})
export class AdminCustomersNew extends BaseForm {
    tags = [];
    all_tags = [];

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService],
            [Admin], [AdminUtils]];
    }

    constructor(http, formbuilder, router, auth, admin, utils) {
        super(http, formbuilder, router, auth, admin, utils);
        this.cancelLink = '/customers';
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
                setTimeout(()=> { this.tooltipError = false; }, 5000);
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

    onSave() {
        if(!this.groupValidate(this.form, 'customer')) return;
        let customer = {};
        customer['customer'] = this.form['customer'].value;
        customer.customer.tags = this.tags;

        this._http
            .post('/admin/customers.json', customer )
            .subscribe(
                (data) => this.saveAddress(data),
                (err) => {
                    this.apiErrors(this.form, 'customer', err.json());
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
                    this._router.navigate(['customers/', customer.customer.id]);
                },
                (err) => {
                    this.apiErrors(this.form, 'default_address', err.json());
                },
            );
    }
}


//------------------------------------------------------------------------------AdminCustomersEdit
@Component({
    selector: 'main',
    templateUrl : 'templates/customer/edit.html',
    pipes: [ProvincePipe]
})
export class AdminCustomersEdit extends BaseForm{
    static get parameters() {
        return [[Http], [FormBuilder], [Router], [ActivatedRoute],
                [AdminAuthService], [Admin], [AdminUtils], [ViewContainerRef]];
    }

    constructor(http, fb, router, params, auth, admin, utils, vcr) {
        super(http, fb, router, auth, admin, utils);
        this._vcr = vcr;
        this.object_id = params.snapshot.params.id;
        this.model = 'customer';
        this.currentLink = '/customers/';
        this.cancelLink = '/customers';
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
        this.customer = data.customer;
        this.customer['full_name'] = `${data.customer.first_name} ${data.customer.last_name}`;
        this.tags = this.api_data.customer.tags; //for child
        this.setDataToControls(this.form, 'customer', this.api_data.customer);

        this._admin.currentUrl({
            'url': '#', 'text': `${this.customer.full_name}`
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

    onSaveNote() {
        let customer = {
            'customer': {
                'note':this.form.customer.controls.note.value,
                'tags':this.tags
            }
        };
        this._http
            .patch(`/admin/customers/${this.object_id}.json`, customer)
            .subscribe(
                (data) => {
                    this.getCustomerAfter(data);
                    this.getAPIData(['/admin/customers/tags.json'],
                                    ['getTagsAfter']);
                },
                (err) => this.apiErrors(this.form, 'customer', err.json()),
            );
            this.formChange = false;
            this._admin.notNavigate = false;
    }

    saveTags() {
        let customer = {'customer': {'tags': this.tags}};
        this._http
            .patch(`/admin/customers/${this.object_id}.json`, customer)
            .subscribe(
                (data) => { 
                    this.getCustomerAfter(data);
                    this.getAPIData(['/admin/customers/tags.json'],
                                    ['getTagsAfter']);
                },
                (err) => this.apiErrors(this.form, 'customer', err.json()),
            );
        this.formChange = false;
        this._admin.notNavigate = false;
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
                (err) => this.apiErrors(this.form, 'customer', err.json()),
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
                (err) => this.apiErrors(this.form, 'customer', err.json()),
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
                (err) => this.apiErrors(this.form, 'customer', err.json()),
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
                (err) => this.apiErrors(this.form, 'customer', err.json()),
            );
    }

    deleteCustomer() {
        this._utils.msgBox(this._vcr, 
                `Delete ${this.customer.full_name}`, 
                `Are you sure you want to delete ${this.customer.full_name}? This action cannot be reversed.`,
                'Delete customer'
            )
            .then(
                () => {
                    this._http
                        .delete(`/admin/customers/${this.object_id}.json`)
                        .subscribe(
                            () => { 
                                this.onCancel();
                                this._admin.footer(`Customer ${this.customer.full_name} has been removed`);
                            },
                            (err) => this.apiErrors(this.form, 'customer', err.json()),
                        );
            }, () => {}
        );
    }
}

//------------------------------------------------------------------------------AdminCustomersModule
@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule,
        AdminComponentsModule,
    ],
    providers: [
    ],
    declarations: [
        AdminCustomers,
        AdminCustomersNew,
        AdminCustomersEdit,
        ProvincePipe
    ]
})
export class AdminCustomersModule {}
