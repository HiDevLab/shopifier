import 'rxjs/Rx';
import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, 
        Validators, Control, ControlGroup } from 'angular2/common';
import { Component, Pipe } from 'angular2/core';
import { Http } from 'angular2/http'
import { Router, RouteParams, RouteConfig,
            ROUTER_DIRECTIVES } from 'angular2/router';

import { Admin } from './admin';
import { AdminAuthService, AdminUtils } from './admin.auth'
import { RichTextEditor } from './components';
import { BaseForm } from './admin.customers'


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


//---------------------------------------------------------------------Products
@Component({
  selector: 'main',
  templateUrl: 'templates/product/products.html',
  directives: [FORM_DIRECTIVES],
})
export class Products extends BaseForm {

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
            'text': 'Import', 'class': 'btn mr10', 
            'click': this.onImport, 'self': this 
        });
        this._admin.headerButtons.push({
            'text': 'Add product', 'class': 'btn btn-blue',
            'click': this.onAdd, 'self': this 
        });

//         this.getPagination('/admin/customers/count.json',
//                             '/admin/customers.json',
//                             'getCustomers');
        this.getAPIData(['/admin/products.json'], ['getProducts']);
    }

    getProducts(data) {
        this.products = data.products;
    }

//     getPaginationAfter() {
//         if (this.last_page == 1)
//             return;
// 
//         this._admin.headerButtons.unshift({
//             'text': '', 'class': 'btn mr30 fa fa-chevron-right',
//             'click': this.onNextPage, 
//             'self': this, 'disabled' : 'disabledNextPage' 
//         });
//         this._admin.headerButtons.unshift({
//             'text': '', 'class': 'btn mr10 fa fa-chevron-left',
//             'click': this.onPrevPage, 'self': this,
//             'disabled' : 'disabledPrevPage'
//         });
//     }

    onAdd(self) {
        self._router.navigate(['NewProduct']);
    }
    
    onEditProduct(product) {
        this.current_product_index = this.products.indexOf(product);
        let link = ['EditProduct', {'id': product.id }];
        this._router.navigate(link);
    }
}


//-----------------------------------------------------------------ProductsNew 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new.html',
  directives: [FORM_DIRECTIVES, RichTextEditor],
})
export class ProductsNew extends BaseForm {

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService],
            [Admin], [AdminUtils]];
    }

    constructor(http, formbuilder, router, auth, admin, utils) {
        super(http, formbuilder, router, auth, admin, utils);
    }

    ngOnInit() {
        this.self = this; // for child components
        this._admin.currentUrl({ 'url':'#', 'text': 'Add product'},1 );

        this._admin.headerButtons = [];
        this._admin.headerButtons.push({
            'text': 'Cancel', 'class': 'btn mr10', 
            'click': this.onCancel, 'self': this 
        });
        this._admin.headerButtons.push ({
            'text': 'Save product', 'class': 'btn btn-blue', 
            'click': this.onSave, 'primary': true, 'self': this 
        });
        this.addForm(this.form, '/admin/products.json', 'product');
//         this.editor = new wysihtml5.Editor('editor', {
//             toolbar: 'toolbar',
//             parserRules:  wysihtml5ParserRules
//         });
    }

    onSave(self) {
        self = self || this;

        if(!self.groupValidate(self.form, 'product')) return;
        let product = {};
        product['product'] = self.form['product'].value;

        self._http
            .post('/admin/products.json', product )
            .subscribe(
                (data) => {},
                (err) => {
                    self.apiErrors(self.form, 'product', err.json());
                },
            );
    }

    onCancel(self) {
        self = self || this;
        self._router.navigate(['Products']);
    }
}
