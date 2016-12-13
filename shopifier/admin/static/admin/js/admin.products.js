import 'rxjs/Rx';
// import 'dragula/dragula'

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
    images = [];

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService],
            [Admin], [AdminUtils]];
    }

    constructor(http, formbuilder, router, auth, admin, utils) {
        super(http, formbuilder, router, auth, admin, utils);
    }

    ngOnInit() {
        let self = this;
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

        this.featherEditor = new Aviary.Feather({
            apiKey: 'be17668f224b43e98bce30693f23e136',
            apiVersion: 3,
            theme: 'minimum',//theme: 'light', // Check out our new 'light' and 'dark' themes!
            tools: 'all',//['enhance', 'orientation', 'focus', 'resize', 'crop', 'effects'],
            appendTo: '',
            language: 'en',
            onSave: function(imageID, newURL) {
                let img = document.getElementById(imageID);
                img.src = newURL;
                img.dataset.type = 'url';
                self.featherEditor.close();
           },
           onError: function(errorObj) {alert(errorObj.message);}
       });

    }

    onSave(self) {
        self = self || this;

        if(!self.groupValidate(self.form, 'product')) return;
        let product = {};
        product['product'] = self.form['product'].value;

        self._http
            .post('/admin/products.json', product )
            .subscribe(
                (data) => self.saveImages(data),
                (err) => {
                    self.apiErrors(self.form, 'product', err.json());
                },
            );
    }

    onCancel(self) {
        self = self || this;
        self._router.navigate(['Products']);
    }

    upLoadImage(event) {
        let files = event.target.files;
        if (files && files[0]) {
            let reader = new FileReader();
            let self = this;
            
            reader.onload = (event) => {
                let i = self.images.length;
                self.images.push({attachment: event.target.result, id: `temp-${i}`, type: 'base64'});
                self.formChange = true;
                self._admin.notNavigate = true;
            };
            reader.readAsDataURL(files[0]);
            let container = window.document.querySelector('#images');
            dragula([container]);
        }
    }

    saveImages(product) {
        let container = window.document.querySelector('#images');
        let images = container.querySelectorAll('img');
        let image = {};
        let url = `/admin/products/${product.product.id}/images.json`;
        this.images = [];
        
        for(let i=0; i < images.length; i++) {
            image = {image: {position: i + 1}};
            if (images[i].dataset.type === 'url') {
                image['image']['src'] = images[i].src;
            } else {
                image['image']['attachment'] = images[i].src;
            }
            this._http
                .post(url, image)
                .subscribe(
                    (data) => {
                        data['image']['type'] = 'url';
                        this.images.push(data['image']);
                        dragula([container]);
                    },
                    (err) => {},
                );
        }
    }

    editImage(id) {
        let img_id = String(id);
        let img = document.getElementById(img_id);
        if (img_id.startsWith('temp-')) {
            this.featherEditor.launch({image: img_id, url: img.src});
            return false;
        }
        let self = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = () => {
            var reader = new FileReader();
            reader.onloadend = () => {
                self.featherEditor.launch({image: img_id, url: reader.result});
                return false;
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', img.src);
        xhr.send();
        
    }

    getBase64Image(img) {
        if (img.id.startsWith('temp-')) {
            return img.src;
        }
        // Create an empty canvas element
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
    
        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
    
        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
}
