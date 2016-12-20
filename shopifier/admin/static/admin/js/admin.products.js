import 'rxjs/Rx';

import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, 
        Validators, Control, ControlGroup } from 'angular2/common';
import { Component, Pipe } from 'angular2/core';
import { Http } from 'angular2/http'
import { Router, RouteParams, RouteConfig,
            ROUTER_DIRECTIVES } from 'angular2/router';

import { Admin } from './admin';
import { AdminAuthService, AdminUtils } from './admin.auth'
import { RichTextEditor,  AdminLeavePage} from './components';
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


//-------------------------------------------------------------ProductsNew(Edit) 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new.html',
  directives: [FORM_DIRECTIVES, RichTextEditor, AdminLeavePage],
})
export class ProductsNew extends BaseForm {
    container_images = undefined;
    images = [];
    api_images = [];

    body_html = '';
    dragOver = undefined;
    ImageAltText = '';

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
        if (this.rich_text_editor) {
            this.rich_text_editor.ngOnDestroy();
        }

        window.removeEventListener('dragenter', this.disableDrop.bind(this), false);
        window.removeEventListener('dragover', this.disableDrop.bind(this), false);
        window.removeEventListener('drop', this.disableDrop.bind(this), false);
    }

    ngOnInit() {
        let self = this;
        this.self = this; // for child components
        this._admin.notNavigate = false;

        if (this.product_id) {
            this._admin.currentUrl({ 'url':'#', 'text': ''},1 );
        } else {
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

        this.addForm(this.form, '/admin/products.json', 'product');

        // Image Editor (apiKey: ???)
        this.featherEditor = new Aviary.Feather({ 
            apiVersion: 3,
            theme: 'light',// Check out our new 'light' and 'dark' themes!
            tools: 'all',
            appendTo: '',
            language: 'en',
            onSave: (imageID, newURL) => {
                let img = document.getElementById(imageID);
                img.src = newURL;
                img.dataset.type = 'url';
                self.featherEditor.close();
                self.formChange = true;
           },
           onError: (errorObj) => {alert(errorObj.message);}
        });

        // drag and drop
        this.container_images = document.querySelector('#images');
        dragula([this.container_images]);

        // drag over
        this.dropzone = document.querySelector('#drop-zone');
        this.dropzone.addEventListener('dragover', this.handleDragOver.bind(this), false);
        this.dropzone.addEventListener('drop', this.addImages.bind(this), false);

        // disable dragover and drop 
        window.addEventListener('dragenter', this.disableDrop.bind(this), false);
        window.addEventListener('dragover', this.disableDrop.bind(this), false);
        window.addEventListener('drop', this.disableDrop.bind(this), false);
    }


    addFormAfter() {
        if (this.product_id) {
            this.getAPIData([
                    `/admin/products/${this.product_id}.json`,
                    `/admin/products/${this.product_id}/images.json`
                ],
                ['getProductAfter', 'getImagesAfter']
            );
        }
    }

    getProductAfter(data) {
        this.api_data = data;
        this.setDataToControls(this.form, 'product', this.api_data.product);
        this.body_html = data.product.body_html;
        let product = this.api_data.product;
        this._admin.currentUrl({'url': '#', 'text': `${product.title}`}, 1);

//         this.disabledNext = undefined;
//         this.disabledPrev = undefined;
    }

    getImagesAfter(data) {
        let images = [];
        for (let i in data.images) {
            data.images[i]['type'] = 'url';
            data.images[i]['alt'] = data.images[i]['alt_text']
            data.images[i]['id'] = data.images[i]['id'].toString();
            images.push(data.images[i]);
        }
        this.images = images;
        this.api_images = images;
    }

    onSave(self) {
        self = self || this;

        if(!self.groupValidate(self.form, 'product')) return;
        let product = {};
        product['product'] = self.form['product'].value;
        product.product['body_html'] = self.body_html;
        if (!self.product_id) {
            self._http.post('/admin/products.json', product )
                .subscribe(
                    (data) => {
                        self.product_id = data.product.id;
                        self.getProductAfter.call(self, data);
                        self.saveImages(self);
                    },
                    (err) => {self.apiErrors(self.form, 'product', err.json());}
            );
        } else {
            self._http.put(`/admin/products/${self.product_id}.json`, product)
                .subscribe(
                    (data) => {
                        self.getProductAfter.call(self, data);
                        self.saveImages(self);
                    },
                    (err) => {self.apiErrors(self.form, 'product', err.json());}
            );
        }
    }

    onCancel(self) {
        self = self || this;
        self._router.navigate(['Products']);
    }

    onDeleteProduct() {
        this._http.delete(`/admin/products/${this.product_id}.json`)
            .subscribe(
                () => this._router.navigate(['Products']),
                (err) => {self.apiErrors(self.form, 'product', err.json());},
            );
    }

    // upload images (dragover)
    addImages(event) {
        this.deleteImage();
        event.stopPropagation();
        event.preventDefault();
        let files = event.target.files || event.dataTransfer.files;
        for(let i=0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onload = this.readerOnLoad.bind(this);
            reader.readAsDataURL(files[i]);
        }
    }
    readerOnLoad(event) {
        this.images.push({
            attachment: event.target.result,
            id: `temp-${Math.floor(Math.random() * 1000)}`,
            type: 'base64'
        });
        this.formChange = true;
        this._admin.notNavigate = true;
        this.dragOver  = undefined;
    };

    // image Preview
    showImage(imageID) {
        let img = this.container_images.querySelector(`[id='${imageID}']`);
        this.imagePreviewSrc = img.src;
        this.showImagePreview = true;
    }

    editAltText(imageID) {
        this.currentImage = this.container_images.querySelector(`[id='${imageID}']`);
        this.altText = this.currentImage.alt;
        this.showEditAltText = true;
    }

    saveAltText() {
        this.currentImage.alt = this.altText;
        this.showEditAltText=undefined;
        this.formChange = true;
    }

    // delete image and/or refresh images from DOM
    deleteImage(imageID) {
        let dom_images = this.container_images.querySelectorAll('img');
        let images = [];
        let image = {};
        let field = '';
        for(let i=0; i < dom_images.length; i++) {
            image = {
                id: dom_images[i].id,
                position: i + 1,
                alt: dom_images[i].alt,
                type: dom_images[i].dataset.type,
            };
            field = (dom_images[i].dataset.type === 'url') ? 'src' : 'attachment';
            image[field] = dom_images[i].src;
            if (image.id != imageID) {
                images.push(image);
            }
        };
        this.images = images;
        this.formChange = true;
    }

    // find image in collection (api_images, images, dom_images)
    findImage(image, images) {
        for (let i=0; i < images.length; i++) {
            if (image.id === images[i].id) {
                return images[i];
            }
        }
        return undefined;
    }

    // get image from api data
    getAPIImage(self, data) {
        data['image']['type'] = 'url';
        data['image']['alt'] = data['image']['alt_text'];
        data['image']['id'] = data['image']['id'].toString();
        self.images.push(data['image']);
        self.api_images.push(data['image']);
        self.images.sort((a, b) => {return a.position-b.position;}); 
    }

    getDOMImage(image, position) {
        return {
            id: image.id,
            src: image.src,
            alt_text: image.alt,
            type: image.dataset.type,
            position: position
        }
    }

    // update image if it necessary
    updateImage(self, new_image, old_image) {
        let data = {};
        if (new_image.alt_text != old_image.alt_text ||
            new_image.position != old_image.position) {
            data = {
                alt_text: new_image.alt_text,
                position: new_image.position
            };
        }
        if (new_image.src != old_image.src) { 
            Object.assign(data, {
                position: new_image.position,
                src: new_image.src
            });
        }
        if (!!Object.keys(data).length) {
            let url = `/admin/products/${self.product_id}/images/${new_image.id}.json`;
            self._http.put(url, {image: data})
                .subscribe((data) => {
                    self.getAPIImage(self, Object.assign({image: old_image}, data));
                }, (err) => {});
        } else {
            self.images.push(new_image);
            self.api_images.push(new_image);
            self.images.sort((a, b) => {return a.position-b.position;}); 
        }
    }

    // add new image
    newImage(self, new_image) {
        let data = {alt_text: new_image.alt_text, position: new_image.position};
        let field = (new_image.type === 'url') ? 'src' : 'attachment';
        data[field] = new_image.src;
        let url = `/admin/products/${self.product_id}/images.json`;
        self._http.post(url, {image: data})
            .subscribe((data) => {self.getAPIImage(self, data);}, (err) => {});
    }

    saveImages(self) {
        self = self || this;
        let dom_images = self.container_images.querySelectorAll('img');
        let new_image = {};
        let old_image = {};
        let api_images = self.api_images.slice(0);
        self.images= [];
        self.api_images= [];
        
        // delete images in DB
        for(let i=0; i < api_images.length; i++) {
            old_image = api_images[i];
            if (!self.findImage(old_image, dom_images)) {
                self._http
                    .delete(`/admin/products/${self.product_id}/images/${old_image.id}.json`)
                    .subscribe(() => {}, (err) => {});
            }
        }

        for(let i=0; i < dom_images.length; i++) {
            new_image = self.getDOMImage(dom_images[i], i + 1);
            old_image = self.findImage(new_image, api_images);
            if (old_image) {
                self.updateImage(self, new_image, old_image);
            } else {
                self.newImage(self, new_image);
            }
        }
        self.formChange = false;
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

    childOf(child, parent) {
        while(child !== parent && child) {
            child = child.parentNode;
        }
        return child === parent;
    }
}


//---------------------------------------------------------------ProductsEdit 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new.html',
  directives: [FORM_DIRECTIVES, RichTextEditor, AdminLeavePage],
})
export class ProductsEdit extends ProductsNew {
}
