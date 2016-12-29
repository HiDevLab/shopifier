import 'rxjs/Rx';

import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, 
        Validators, Control, ControlGroup } from 'angular2/common';
import { Component, Pipe } from 'angular2/core';
import { Http } from 'angular2/http'
import { Router, RouteParams, RouteConfig,
            ROUTER_DIRECTIVES } from 'angular2/router';

import { Admin } from './admin';
import { AdminAuthService, AdminUtils } from './admin.auth'
import { RichTextEditor,  AdminLeavePage, Popover} from './components';
import { BaseForm } from './admin.baseform'


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


//------------------------------------------------------------------------------Products
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


//------------------------------------------------------------------------------ProductsNew(Edit) 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new-edit.html',
  directives: [FORM_DIRECTIVES, RichTextEditor, AdminLeavePage, Popover],
})
export class ProductsNew extends BaseForm {
    container_images = undefined;
    images = [];
    api_images = [];

    body_html = '';

    dragOver = undefined;
    dragOverVariant = undefined;
    currentVariant = undefined;
    ImageAltText = '';
    imageUrl = '';

    options = [{name: 'Size', values: [], val: '', tooltipError: 0, focus: 0}];
    variants = [];
    api_variants = [];
    selectAllVariants = 0;

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService],
            [Admin], [AdminUtils], [RouteParams]];
    }

    constructor(http, formbuilder, router, auth, admin, utils, routeparams) {
        super(http, formbuilder, router, auth, admin, utils);
        this._routeParams = routeparams;

        this.object_id = this._routeParams.get('id');
        this.model = 'product';
        this.currentLink = 'NewProduct';
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

        this._admin.headerButtons = [];
        if (this.object_id) {
            this.currentLink = 'EditProduct';
            this._admin.currentUrl({ 'url':'#', 'text': ''},1 );

            this._admin.headerButtons.push({
                'text': '', 'class': 'btn mr10 fa fa-chevron-left',
                'click': this.onPrev, 'self': this, 'disabled' : 'disabledPrev'
            });
    
            this._admin.headerButtons.push({
                'text': '', 'class': 'btn mr10 fa fa-chevron-right', 
                'click': this.onNext, 'self': this, 'disabled' : 'disabledNext'
            });
        } else {
            this._admin.currentUrl({ 'url':'#', 'text': 'Add product'},1 );
        }
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

        this.refreshDOM();

        // drag and drop
        this.container_images = this.DOMElement('#images');
//         this.container_images2 = this.DOMElement('#test');
        this.drake = dragula(
            [this.container_images],
            {revertOnSpill: true,}
        );
        this.drake.on('drop', this.dropImage.bind(this));
        this.drake.on('shadow', this.shadowImage.bind(this));
        this.drake.on('drag', this.dragImage.bind(this));
        this.drake.on('dragend', this.dragEnd.bind(this));

        // disable dragover and drop 
        window.addEventListener('dragenter', this.disableDrop.bind(this), false);
        window.addEventListener('dragover', this.disableDrop.bind(this), false);
        window.addEventListener('drop', this.disableDrop.bind(this), false);
        window.addEventListener('dragend', this.dragEnd.bind(this), false);
    }

    refreshDOM() {
        this.popover_bulk_actions = this.DOMElement('#bulk-actions');
        this.popovers = [this.popover_bulk_actions];
    }


    shadowImage(el) {
//         console.log(el, 'shadow');
        el = el.parentNode;
        if(el.nodeName==='TR' && el.dataset && el.dataset.variant) {
            this.currentVariant = el.dataset.variant;
        } else {
            this.currentVariant = undefined;
        }
    }

    dropImage(el) {
//         console.log(el, 'drop');
        if (
            el.parentNode && el.parentNode.dataset && el.dataset &&
            el.parentNode.dataset.variant && el.dataset.image) {
                Object.assign(
                    this.variants[el.parentNode.dataset.variant],
                    {img: this.images[el.dataset.image]});
                this.drake.cancel(true);
        }
    }

    dragImage(el) {
//         console.log(el, 'drag');
        if (el.nodeName != 'LI') {
            this.drake.cancel(true);
//             console.log(el, 'drag', true);
        }
    }

    dragEnd(el) {
//         console.log(el, 'end');
        this.currentVariant = undefined;
    }

    dragLeave(evt) {
        let el = evt.target;
        console.log(el, 'dragleave');
        if (!this.hasAttr(el, 'dropzone')) {
            this.dragOver = undefined;
            this.dragOverVariant = undefined;
            evt.preventDefault();
            this.currentVariant = undefined;
        }
    }

    handleDragOver(evt, flag) {
//         console.log(evt.target, 'handle');
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
        this[flag] = true;
    }

    disableDrop(evt) {
        let el = evt.target;
        if (!this.hasAttr(el, 'dropzone')) {
            this.dragOver = undefined;
            this.dragOverVariant = undefined;
            evt.preventDefault();
            evt.dataTransfer.effectAllowed = "none";
            evt.dataTransfer.dropEffect = "none";
            this.currentVariant = undefined;
        }
//         console.log(el, this.dragOver, 'disabledrop');
    }





    addFormAfter() {
        if (this.object_id) {
            this.getAPIData([
                    `/admin/products/${this.object_id}.json`,
                    `/admin/products/${this.object_id}/images.json`,
                    `/admin/products/${this.object_id}/variants.json`
                ],
                ['getProductAfter', 'getImagesAfter', 'getVariantsAfter']
            );
        }
    }

    getProductAfter(data) {
        this.api_data = data;
        this.setDataToControls(this.form, 'product', this.api_data.product);
        this.body_html = data.product.body_html;
        let product = this.api_data.product;
        this._admin.currentUrl({'url': '#', 'text': `${product.title}`}, 1);
        this.options = [];
        for (let i=0; i < data.product.options.length; i++) {
            Object.assign(
                data.product.options[i],
                {val: '', tooltipError: 0, focus: 0}
            );
            this.options.push(data.product.options[i]);
        }

        this.disabledNext = undefined;
        this.disabledPrev = undefined;
    }

    getImagesAfter(data) {
        let images = [];
        for (let i=0; i < data.images.length; i++) {
            Object.assign(data.images[i], {
                type: 'url', 
                alt: data.images[i].alt_text,
                id: data.images[i].id.toString()
            });
            images.push(data.images[i]);
        }
        this.images = images.slice(0);
        this.api_images = images.slice(0);
    }

    getVariantsAfter(data) {
        let variants = [];
        for (let i=0; i < data.variants.length; i++) {
            Object.assign(data.variants[i], {
                select: 0, id: data.variants[i].id.toString()
            });
            variants.push(data.variants[i]);
        }
        this.variants = variants.slice(0);
        this.api_variants = variants.slice(0);
        setTimeout(()=> { 
            let table = window.document.querySelectorAll('#variants-table tr')
            for (let i=0; i < table.length; i++) {
                this.drake.containers.push(table[i]);
            }
        }, 100);
        
    }


    onSave(self) {
        self = self || this;

        if(!self.groupValidate(self.form, 'product')) return;
        let product = {};
        product['product'] = self.form['product'].value;
        product.product['body_html'] = self.body_html;
        let options = [];
        if (self.options[0].values.length) {
            options.push({
                name: self.options[0].name,
                values: self.options[0].values
            });
        }
        if (self.options.length > 1 && self.options[1].values.length) {
            options.push({
                name:self.options[1].name,
                values: self.options[1].values
            });
        }
        if (self.options.length > 2 && self.options[2].values.length) {
            options.push({
                name:self.options[2].name,
                values: self.options[2].values
            });
        }
        product.product['options'] = options;
        if (!self.object_id) {
            self._http.post('/admin/products.json', product )
                .subscribe(
                    (data) => {
                        self.object_id = data.product.id;
                        self.getProductAfter.call(self, data);
                        self.saveImages(self);
                        self.saveVariants(self);
                    },
                    (err) => {self.apiErrors(self.form, 'product', err.json());}
                );
        } else {
            self._http.put(`/admin/products/${self.object_id}.json`, product)
                .subscribe(
                    (data) => {
                        self.getProductAfter.call(self, data);
                        self.saveImages(self);
                        self.saveVariants(self);
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
        this._http.delete(`/admin/products/${this.object_id}.json`)
            .subscribe(
                () => this._router.navigate(['Products']),
                (err) => {self.apiErrors(self.form, 'product', err.json());},
            );
    }

//------------------------------------------------------------------------Images
    // upload images (dragover)
    addImages(event, variant) {
        this.deleteImage();
        this.currentVariant = variant;
        event.stopPropagation();
        event.preventDefault();
        let files = event.target.files || event.dataTransfer.files;
        for(let i=0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onload = this.readerOnLoadImage.bind(this);
            reader.readAsDataURL(files[i]);
        }
    }
    readerOnLoadImage(event) {
        this.images.push({
            attachment: event.target.result,
            id: `temp-${this.getId()}`,
            type: 'base64'
        });
        this.formChange = true;
        this._admin.notNavigate = true;
        this.dragOver  = undefined;
        this.dragOverVariant  = undefined;
        if (this.isIndex(this.currentVariant)) {
            Object.assign(
                this.variants[this.currentVariant],
                {img: this.images[this.images.length-1]}
            );
            this.currentVariant = undefined;
        }
    };

    addImageFromUrl(imageUrl) {
        let self = this;
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status == 200 && xhr.response.type === 'image/jpeg') {
                self.images.push({
                    src: imageUrl,
                    id: `temp-${Math.floor(Math.random() * 1000)}`,
                    type: 'url'
                });
                self.formChange = true;
                self.urlImageErrors = [];
                self.showAddImageFromUrl = undefined;
            } else {
                self.urlImageErrors = ['Invalid URL provided.'];
            }
        };
        xhr.open('GET', imageUrl);
        xhr.send();
    }

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
            let url = `/admin/products/${self.object_id}/images/${new_image.id}.json`;
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
        let url = `/admin/products/${self.object_id}/images.json`;
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
                    .delete(`/admin/products/${self.object_id}/images/${old_image.id}.json`)
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

    // check has element(parrent) attr or not 
    hasAttr(el, attr) {
        while(el) {
            if (el.dataset && el.dataset[attr]) {
                return true;
            }
            el = el.parentNode;
        }
        return false;
    }

    childOf(child, parent) {
        while(child !== parent && child) {
            child = child.parentNode;
        }
        return child === parent;
    }

//----------------------------------------------------------------------Variants
     addOption() {
        let names = ['Size', 'Color', 'Material'];
        let current_names = [];
        for (let i=0; i < this.options.length; i++) {
            current_names.push(this.options[i].name);
        }
        for (let i=0; i < names.length; i++) {
            let name = names[i];
            if (current_names.indexOf(name) < 0) {
                this.options.push(
                    {
                        name: name, values: [], val: '', tooltipError: 0,
                        focus: 0
                    }
                );
                return;
            }
        }
    }

    deleteOption(i) {
        this.options.splice(i, 1);
        this.refreshVariants();
    }

    deleteOptionValue(option, j) {
        option.values.splice(j, 1);
        this.refreshVariants();
    }

    changeOptionValue(option) {
        if (option.val) {
            if (option.values.indexOf(option.val) > -1 ) {
                option.tooltipError = true;
                setTimeout(
                    (option)=> {option.tooltipError = false;}, 3000, option);
                return;
            }
            option.values.push(option.val.trim());
            option.val = '';
            this.formChange = true;
            this._admin.notNavigate = true;
            this.refreshVariants();
            option.tooltipError = false;
        }
    }

    onKeyUpOptionValue(event, option) {
        if (event.code == 'Backspace' && option.val.length < 1 ) {
            option.values.pop();
            this.refreshVariants();
        }
    }
//     addTag(i, value) {
//         this.options[i].values.push(value);
//         this.formChange = true;
//         this._admin.notNavigate = true;
//     }

    refreshVariants() {
        let options1 = this.options[0].values;
        let options2 = [];
        let options3 = [];
        this.variants = [];
        if (this.options.length > 1) {
            options2 = this.options[1].values;
        }
        if (this.options.length > 2) {
            options3 = this.options[2].values;
        }

        for (let i1=0; i1 < options1.length; i1++ ) {
            if (!options2.length) {
                this.variants.push({ 
                    select: 1, 
                    option1: options1[i1], 
                    option2: null, option3: null,
                    price: '0.00', sku: '', barcode: ''
                });
            } else {
                for (let i2=0; i2 < options2.length; i2++) {
                    if (!options3.length) {
                        this.variants.push({ 
                            select: 1, 
                            option1: options1[i1],
                            option2: options2[i2],
                            option3: null,
                            price: '0.00', sku: '', barcode: ''
                        });
                    } else {
                        for (let i3=0; i3 < options3.length; i3++) {
                            this.variants.push({ 
                                select: 1, 
                                option1: options1[i1],
                                option2: options2[i2],
                                option3: options3[i3], 
                                price: '0.00', sku: '', barcode: ''
                            });
                        }
                    }
                }
            }
        }
    }

    saveVariants(self) {
        self = self || this;
        let api_variants = self.api_variants.slice(0);
        let variants = [];
        self.api_variants= [];
        let variant = {};
        let position = 1;
        // delete unselected variants
        for(let i=0; i < self.variants.length; i++) {
            variant = self.variants[i];
            if (variant.select) {
                variant['position'] = position++;
                delete variant.select;
                variants.push(variant);
            }
        }
        self.variants= [];

        // delete variants in DB
        for(let i=0; i < api_variants.length; i++) {
            old_variant = api_variants[i];
            if (!self.findObject(old_variant, variants)) {
                self._http
                    .delete(`/admin/products/${self.object_id}/variants/${old_variant.id}.json`)
                    .subscribe(() => {}, (err) => {});
            }
        }

        for(let i=0; i < variants.length; i++) {
            let new_variant = variants[i];
            let old_variant = self.findObject(new_variant, api_variants);
            if (old_variant) {
                self.updateVariant(self, new_variant, old_variant);
            } else {
                self.newVariant(self, new_variant);
            }
        }
        self.formChange = false;
    }

    // get variant from api data
    getAPIVariant(self, data) {
        data.variant.id = data.variant.id.toString();
        data.variant['select'] = 0;
        self.variants.push(data.variant);
        self.api_variants.push(data.variant);
        self.variants.sort((a, b) => {return a.position-b.position;}); 
    }

    // add new variant
    newVariant(self, variant) {
        delete variant.select;
        let url = `/admin/products/${self.object_id}/variants.json`;
        self._http.post(url, {variant: variant})
            .subscribe((data) => {self.getAPIVariant(self, data);}, (err) => {});
    }


   // update variant if it necessary
    updatevariant(self, new_image, old_image) {
//         let data = {};
//         if (new_image.alt_text != old_image.alt_text ||
//             new_image.position != old_image.position) {
//             data = {
//                 alt_text: new_image.alt_text,
//                 position: new_image.position
//             };
//         }
//         if (new_image.src != old_image.src) { 
//             Object.assign(data, {
//                 position: new_image.position,
//                 src: new_image.src
//             });
//         }
//         if (!!Object.keys(data).length) {
//             let url = `/admin/products/${self.object_id}/images/${new_image.id}.json`;
//             self._http.put(url, {image: data})
//                 .subscribe((data) => {
//                     self.getAPIImage(self, Object.assign({image: old_image}, data));
//                 }, (err) => {});
//         } else {
//             self.images.push(new_image);
//             self.api_images.push(new_image);
//             self.images.sort((a, b) => {return a.position-b.position;}); 
//         }
    }

    selectVariants(set) {
        this.variants.forEach((v)=> {v.select = set;});
        this.selectAllVariants = set;
    }

    countSelectedVariants() {
        let count = 0;
        this.variants.forEach((v)=> {if (v.select) {count++};});
        if (count === this.variants.length) {
            this.selectAllVariants = 1;
        } else {
            this.selectAllVariants = 0;
        }
        
        switch(count) {
            case 0:
                return [0, ''];
            case 1:
                return [1, '1 variant selected'];
        }
        return [count, `${count} variants selected`];
    }

    filterVariants(option, filter) {
        let eq = false;
        this.variants.forEach((v)=> {
            switch(option){
                case 0:
                    eq = (v.option1 === filter);
                    break;
                case 1:
                    eq = (v.option2 === filter);
                    break;
                default:
                    eq = (v.option3 === filter);
            }
            v.select = (eq) ? 1:0;
        });
    }



    onPopover(event, popover){
        event.preventDefault();
        event.stopPropagation();
        this.hidePopovers(popover);
        this.switchPopover(popover);
    }

    hidePopover(popover) {
        if (popover.classList.contains('show')) {
            popover.classList.remove('show');
            popover.classList.add('hide');
        }
    }
    hidePopovers(exclude) {
        for (let i in this.popovers) {
            if (this.popovers[i] != exclude) {
                this.hidePopover(this.popovers[i]);
            }
        }
    }
    switchPopover(popover, event) {
        let show = popover.classList.contains('hide');
        popover.classList.remove(show ? 'hide' : 'show');
        popover.classList.add(show ? 'show' : 'hide');
        if (show) {
            let event = new Event('show');
            popover.dispatchEvent(event);
        }
    }

    getId(){
        return Math.floor(Math.random() * 1000);
    }
}

//------------------------------------------------------------------------------ProductsEdit 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new-edit.html',
  directives: [FORM_DIRECTIVES, RichTextEditor, AdminLeavePage, Popover],
})
export class ProductsEdit extends ProductsNew {
}
