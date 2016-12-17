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


//---------------------------------------------------------------ProductsNew 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new.html',
  directives: [FORM_DIRECTIVES, RichTextEditor],
})
export class ProductsNew extends BaseForm {
    images = [];
    html_body = undefined;
    dragOver = undefined;

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService],
            [Admin], [AdminUtils], [RouteParams]];
    }

    constructor(http, formbuilder, router, auth, admin, utils, routeparams) {
        super(http, formbuilder, router, auth, admin, utils);
        this._routeParams = routeparams;
        this.product_id = this._routeParams.get('id');
    }

    ngOnDestroy() {
        // for child components onDestroy isn't called automatically
        this.rich_text_editor.ngOnDestroy();
    }


    ngOnInit() {
        let self = this;
        this.self = this; // for child components
        if (!this.product_id) {
            this._admin.currentUrl({ 'url':'#', 'text': 'Add product'},1 );
        }
        
        this._admin.headerButtons = [];
        this._admin.headerButtons.push({
            'text': 'Cancel', 'class': 'btn mr10', 
            'click': this.onCancel, 'self': this 
        });
        this._admin.headerButtons.push ({
            'text': 'Save product', 'class': 'btn btn-blue', 
            'click': this.onSave, 'primary': true, 'self': this 
        });
        if (this.product_id) {
            this.addForm(this.form, `/admin/products/${this.product_id}.json`, 'product');
        } else {
            this.addForm(this.form, '/admin/products.json', 'product');
        }
//      apiKey: ???
        this.featherEditor = new Aviary.Feather({ 
            apiVersion: 3,
            theme: 'light',// Check out our new 'light' and 'dark' themes!
            tools: 'all',
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

        dragula([document.querySelector('#images')]);
        this.dropzone = document.querySelector('#drop-zone');
        this.dropzone.addEventListener('dragover', this.handleDragOver.bind(this), false);
        this.dropzone.addEventListener('drop', this.upLoadImage.bind(this), false);

        // disable drag and drop 
        window.addEventListener('dragenter', this.disableDrop.bind(this), false);
        window.addEventListener('dragover', this.disableDrop.bind(this), false);
        window.addEventListener('drop', this.disableDrop.bind(this), false);
    }

    onSave(self) {
        self = self || this;

        if(!self.groupValidate(self.form, 'product')) return;
        let product = {};
        product['product'] = self.form['product'].value;
        product.product['html_body'] = self.html_body;
        if (!self.product_id) {
            self._http.post('/admin/products.json', product )
                .subscribe(
                    (data) => {
                        self.product_id = data.product.id
                        self.saveImages(self);
                    },
                    (err) => {self.apiErrors(self.form, 'product', err.json());}
            );
        } else {
            self._http.put(`/admin/products/${self.product_id}.json`, product)
                .subscribe(
                    (data) => {self.saveImages(self);},
                    (err) => {self.apiErrors(self.form, 'product', err.json());}
            );
        }
    }

    onCancel(self) {
        self = self || this;
        self._router.navigate(['Products']);
    }

    upLoadImage(event) {
        this.deleteImage();
        event.stopPropagation();
        event.preventDefault();
        let files = event.target.files || event.dataTransfer.files;
        let self = this;
        if (files && files[0]) {
            let reader = new FileReader();
            reader.onload = (event) => {
                self.images.push({
                    attachment: event.target.result,
                    id: `temp-${Math.floor(Math.random() * 1000)}`,
                    type: 'base64'
                });
                self.formChange = true;
                self._admin.notNavigate = true;
                self.dragOver  = undefined;
            };
            reader.readAsDataURL(files[0]);
        }
    }

    deleteImage(imageID) {
        // delete image and/or refresh images from DOM
        let container = window.document.querySelector('#images');
        let images = container.querySelectorAll('img');
        let new_images = [];
        let image = {};
        let field = '';
        for(let i=0; i < images.length; i++) {
            image = {
                id: images[i].id,
                position: i + 1,
                alt: images[i].alt,
                type: images[i].dataset.type,
            };
            field = (images[i].dataset.type === 'url') ? 'src' : 'attachment';
            image[field] = images[i].src;
            if (image.id != imageID) {
                new_images.push(image);
            }
        };
        this.images = new_images;
    }

    saveImages(self) {
        self = self || this;
        let container = window.document.querySelector('#images');
        let images = container.querySelectorAll('img');
        let image = {};
        let url = '';
        self.images = [];
        let field = '';

        for(let i=0; i < images.length; i++) {
            image = {image: {position: i + 1, alt: images[i].alt}};
            field = (images[i].dataset.type === 'url') ? 'src' : 'attachment';
            image['image'][field] = images[i].src;
            if (images[i].id.startsWith('temp')) {
                url = `/admin/products/${self.product_id}/images.json`;
                self._http.post(url, image)
                    .subscribe((data) => self.readImage(self, data, container), (err) => {}
                );
            } else {
                url = `/admin/products/${self.product_id}/images/${images[i].id}.json`;
                self._http.put(url, image)
                    .subscribe((data) => self.readImage(self, data, container), (err) => {}
                );
            }
        }
    }

    readImage(self, data, container) {
        data['image']['type'] = 'url';
        self.images.push(data['image']);
        self.images.sort((a, b) => {return a.position-b.position;}); 
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

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
        this.dragOver = true;
    }

    disableDrop(evt) {
        let el = evt.target;
        if (el != this.dropzone && !this.childOf(el, this.dropzone)) {
            this.dragOver = undefined;
            evt.preventDefault();
            evt.dataTransfer.effectAllowed = "none";
            evt.dataTransfer.dropEffect = "none";
        }
    }

    childOf(child, parrent) {
        while(child !== parrent && child) {
            child = child.parentNode;
        }
        return child === parrent;
    }

}
