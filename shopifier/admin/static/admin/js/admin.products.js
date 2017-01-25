import 'rxjs/Rx';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
    Validators } from '@angular/forms';
import { Http } from '@angular/http';
import { NgModule, Component, ViewContainerRef } from '@angular/core';
import { Router, Routes, ActivatedRoute } from '@angular/router';

import { AdminAuthService, AdminUtils } from './admin.auth';
import { Admin } from './admin';
import { BaseForm } from './admin.baseform';
import { AdminComponentsModule, RichTextEditor,  AdminLeavePage, Popover,
    Calendar, Var } from './components';


//------------------------------------------------------------------------------AdminCollections
@Component({
    selector: 'main',
    templateUrl: 'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminCollections {
    component = 'Collections';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------AdminTransfers
@Component({
    selector: 'main',
    templateUrl: 'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminTransfers {
    component = 'Transfers';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------AdminProducts
@Component({
  selector: 'main',
  templateUrl: 'templates/product/products.html',
  interpolation: ['[[', ']]'],
})
export class AdminProducts extends BaseForm {

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [AdminAuthService],
                [Admin], [AdminUtils], [ViewContainerRef]];
    }

    constructor(http, fb, router, auth, admin, utils, vcr) {
        super(http, fb, router, auth, admin, utils);
        this._vcr = vcr;
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

    onAdd() {
        this._router.navigate(['products/new']);
    }

    onEditProduct(product) {
        this.current_product_index = this.products.indexOf(product);
        this._router.navigate(['/products/', product.id]);
    }
}


//------------------------------------------------------------------------------AdminProductsNew(Edit) 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new-edit.html',
  interpolation: ['[[', ']]'],
  directives: [RichTextEditor, AdminLeavePage, Popover, Calendar, Var],
})
export class AdminProductsNew extends BaseForm {
    container_images = undefined;
    images = [];
    api_images = [];

    body_html = '';

    dragOverImg = undefined;
    showAllImages = false;
    currentVariant = undefined;
    ImageAltText = '';
    imageUrl = '';

    options = [{name: 'Size', values: [], val: '', tooltipError: 0, focus: 0}];
    variants = [];
    api_variants = [];
    selectAllVariants = 0;

    inventoryManagement = false;

    showBulkUpdateImages = false;
    bulkImagesPage = 0;
    bulkCurrentImage = undefined;

    online_store = 0;

    showCalendar = false;
    published_at = ['', ''];

    times = [];
    _times = [ '00:00 am',
        '00:30 am', '01:00 am', '01:30 am', '02:00 am', '02:30 am', '03:00 am',
        '03:30 am', '04:00 am', '04:30 am', '05:00 am', '05:30 am', '06:00 am',
        '06:30 am', '07:00 am', '07:30 am', '08:00 am', '08:30 am', '09:00 am',
        '09:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 am',
        '00:30 pm', '01:00 pm', '01:30 pm', '02:00 pm', '02:30 pm', '03:00 pm',
        '03:30 pm', '04:00 pm', '04:30 pm', '05:00 pm', '05:30 pm', '06:00 pm',
        '06:30 pm', '07:00 pm', '07:30 pm', '08:00 pm', '08:30 pm', '09:00 pm',
        '09:30 pm', '10:00 pm', '10:30 pm', '11:00 pm', '11:30 pm'
    ]

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [ActivatedRoute],
                [AdminAuthService], [Admin], [AdminUtils], [ViewContainerRef]];
    }

    constructor(http, fb, router, params, auth, admin, utils, vcr) {
        super(http, fb, router, auth, admin, utils);
        this._vcr = vcr;
        this.object_id = params.snapshot.params.id;
        this.model = 'product';
        this.currentLink = '/product/new';
        this.cancelLink = '/products';
    }

    ngOnDestroy() {
        // for child components onDestroy isn't called automatically
        if (this.rich_text_editor) {
            this.rich_text_editor.ngOnDestroy();
        }

        window.removeEventListener('dragenter', this.disableDrop, false);
        window.removeEventListener('dragover', this.disableDrop, false);
        window.removeEventListener('dragleave', this.dragLeave, false);
    }

    ngOnInit() {
        this.self = this; // for child components
        this._admin.notNavigate = false;

        this.addForm(this.form, '/admin/products.json', 'product');

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
    }

    AfterViewInit(){
        // Image Editor (apiKey: ???)
        this.featherEditor = new Aviary.Feather(
            { 
                apiVersion: 3,
                theme: 'light',// Check out our new 'light' and 'dark' themes!
                tools: 'all',
                appendTo: '',
                language: 'en',
                onSave: this.saveImage.bind(this),
                onError: (errorObj) => {alert(errorObj.message);}
            }
        );

        this.popovers = ['bulk_actions', 'publish_time'];
        // drag and drop
        this.container_images = this.getByID('images');
        this.drake = dragula(
            [this.container_images],
            {
                revertOnSpill: true,
                moves: (el, source) => {
                    return this.hasAttr(source, 'dragzone');
                }
            }
        );
        this.drake.on('drop', this.dropImage.bind(this));
        this.drake.on('shadow', this.shadowImage.bind(this));
        this.drake.on('dragend', this.dragEnd.bind(this));

        // disable dragover and drop 
        window.addEventListener('dragenter', this.disableDrop.bind(this), false);
        window.addEventListener('dragover', this.disableDrop.bind(this), false);
        window.addEventListener('dragleave', this.dragLeave.bind(this), false);

        let table = window.document.querySelectorAll('#variants-table tr')
        for (let i=0; i < table.length; i++) {
            this.drake.containers.push(table[i]);
        }
    }

    addFormAfter() {
        if (this.object_id) {
            this.getAPIData(
                [
                    `/admin/products/${this.object_id}.json`,
                    `/admin/products/${this.object_id}/images.json`,
                    `/admin/products/${this.object_id}/variants.json?limit=100`
                ],
                ['getProductAfter', 'getImagesAfter', 'getVariantsAfter']
            );
        }
    }

    getProductAfter(data) {
        this.api_data = data;
        this.setDataToControls(this.form, 'product', this.api_data.product);
        this.body_html = data.product.body_html;
        if (this.rich_text_editor) {
            this.rich_text_editor.editor.setValue(this.body_html, false);
            window.focus();
            this.formChange = false;
        }
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
            });
            images.push(data.images[i]);
        }
        this.images = images.slice(0);
        this.api_images = images.slice(0);
    }

    getVariantsAfter(data) {
        let variants = [];
        this.inventoryManagement = false;
        for (let i=0; i < data.variants.length; i++) {
            Object.assign(data.variants[i], {
                select: 0, id: data.variants[i].id.toString()
            });
            variants.push(data.variants[i]);
            this.inventoryManagement = (
                this.inventoryManagement ||
                data.variants[i].inventory_management==='shopifier'
            );
        }
        this.variants = variants.slice(0);
        this.api_variants = variants.slice(0);
    }

    onSave() {
        if(!this.groupValidate(this.form, 'product')) return;
        let product = {};
        product['product'] = this.form['product'].value;
        product.product['body_html'] = this.body_html;
        let options = [];
        if (this.options[0].values.length) {
            options.push({
                name: this.options[0].name,
                values: this.options[0].values
            });
        }
        if (this.options.length > 1 && this.options[1].values.length) {
            options.push({
                name:this.options[1].name,
                values: this.options[1].values
            });
        }
        if (this.options.length > 2 && this.options[2].values.length) {
            options.push({
                name:this.options[2].name,
                values: this.options[2].values
            });
        }
        product.product['options'] = options;
        if (!this.object_id) {
            this._http.post('/admin/products.json', product )
                .subscribe(
                    (data) => {
                        this.object_id = data.product.id;
                        this.getProductAfter(data);
                        this.saveImages();
                        this.saveVariants();
                    },
                    (err) => {this.apiErrors(this.form, 'product', err.json());}
                );
        } else {
            this._http.put(`/admin/products/${this.object_id}.json`, product)
                .subscribe(
                    (data) => {
                        this.getProductAfter(data);
                        this.saveImages();
                        this.saveVariants();
                    },
                    (err) => {this.apiErrors(this.form, 'product', err.json());}
                );
        }
    }

    deleteProduct() {
        let title = this.form.product.value.title;
        this._utils.msgBox(this._vcr, {
                title: `Delete ${title}?`, 
                text: `Are you sure you want to delete the product ${title}? This action cannot be reversed.`,
                btn: 'Delete product'
            })
            .then(
                () => {
                    this._http.delete(`/admin/products/${this.object_id}.json`)
                        .subscribe(
                            () => { 
                                this._router.navigate(['/products']);
                                this._admin.footer('Successfully deleted product');
                            },
                            err => {this.apiErrors(this.form, 'product', err.json());},
                        );
            }, () => {}
        );
    }

//------------------------------------------------------------------------Images
    //dragula event
    shadowImage(el) {
        el = el.parentNode;
        if(el.nodeName==='TR' && el.dataset && el.dataset.variant) {
            this.currentVariant = el.dataset.variant;
        } else {
            this.currentVariant = undefined;
        }
    }
    //dragula event
    dropImage(el) {
        if (
            el.parentNode && el.parentNode.dataset && el.dataset &&
            el.parentNode.dataset.variant && el.dataset.image) {
                Object.assign(
                    this.find(this.variants, 'id', el.parentNode.dataset.variant),
                    {image: this.find(this.images, 'id', el.dataset.image)});
                this.drake.cancel(true);
        }
    }
    //dragula event
    dragEnd(el) {
        this.currentVariant = undefined;
        this.refreshImagesFromDOM();
        this.formChange = true;
        this._admin.notNavigate = true;
    }
    //window event
    dragLeave(evt) {
        if (evt.clientX <= 0 && evt.clientY <= 0) {
            this.currentVariant = undefined;
            this.dragOverImg = undefined;
        }
    }
    //window event
    dragOver(evt, flag) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
        this[flag] = true;
    }
    //window event
    disableDrop(evt) {
        let el = evt.target;
        if (!this.hasAttr(el, 'dropzone')) {
            this.dragOverImg = undefined;
            evt.preventDefault();
            evt.dataTransfer.effectAllowed = "none";
            evt.dataTransfer.dropEffect = "none";
            this.currentVariant = undefined;
        }
    }

    // upload images (dragover)
    addImages(event, variant) {
        this.currentVariant = variant;
        event.stopPropagation();
        event.preventDefault();
        let files = event.target.files || event.dataTransfer.files;
        for(let i=0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onload = (evt) => {
                this.addImage(evt.target.result, 'attachment')
            };
            reader.readAsDataURL(files[i]);
        }
        event.target.files = null;
    }

    // add new image
    addImage(src, type, position) {
        if (this.object_id) {
            let data = {};
            data[type] = src;
            if (position) {
                data['position'] = position;
            }
            let url = `/admin/products/${this.object_id}/images.json`;
            this._http.post(url, {image: data})
                .subscribe((data) => {
                    this.getAPIImage(data);
                },
                (err) => {}
            );
        } else {
            if (type==='src') {
                this.images.push({src: src, id: -this.getId(), type: type });
            } else {
                this.images.push({ attachment: src, id: -this.getId(), type: type });
            }
            if (this.currentVariant) {
                Object.assign(
                    this.find(this.variants, 'id', this.currentVariant),
                    {image: this.images[this.images.length-1]}
                );
                this.currentVariant = undefined;
            }
            this.dragOverImg = undefined;
            this.formChange = true;
            this._admin.notNavigate = true;
        }
    }


    // get image from api data
    getAPIImage(data) {
        let image = data.image;
        Object.assign(
            image, {type: 'src', alt: image.alt_text}
        );
        this.images.push(image);
        this.api_images.push(image);
        this.images.sort((a, b) => {return a.position-b.position;});
        if (this.currentVariant) {
            Object.assign(
                this.find(this.variants, 'id', this.currentVariant),
                {image: this.images[this.images.length-1]}
            );
            this.currentVariant = undefined;
        }
        this.dragOverImg = undefined;
    }

    addImageFromUrl(imageUrl) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status == 200 && xhr.response.type === 'image/jpeg') {
                this.addImage(imageUrl, 'src')
                this.urlImageErrors = [];
                this.showAddImageFromUrl = undefined;
            } else {
                this.urlImageErrors = ['Invalid URL provided.'];
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

    onDeleteImage(image) {
        this.currentImage = image;
        if(this.object_id) {
            this.showDeleteImage = true;
        } else {
            this.deleteImage();
        }
    }

    // delete image
    deleteImage() {
        let id = this.currentImage.id;
        let index = this.findIndex(this.images, 'id', id);
        if (this.isIndex(index)) {
            this.images.splice(index, 1);
        }
        index = this.findIndex(this.api_images, 'id', id);
        if (this.isIndex(index)) {
            this.api_images.splice(index, 1);
            this._http
                .delete(`/admin/products/${this.object_id}/images/${id}.json`)
                .subscribe(() => {}, (err) => {}
            );
        }
        this.variants.forEach((variant) => {
            if (variant.image && variant.image.id == id) {
                variant.image = undefined;
            }
        });
        this.formChange = true;
        this._admin.notNavigate = true;
    }

    refreshImagesFromDOM(){
        let dom_images = this.container_images.querySelectorAll('img');
        let images = [];
        let image = {};
        let field = '';
        for(let i=0; i < dom_images.length; i++) {
            image = {
                id: Number(dom_images[i].id),
                position: i + 1,
                alt: dom_images[i].alt,
                type: dom_images[i].dataset.type,
            };
            field = (dom_images[i].dataset.type === 'url') ? 'src' : 'attachment';
            image[field] = dom_images[i].src;
            images.push(image);
        };
        this.images = images;
    }


    // update image if it necessary
    updateImage(new_image, old_image) {
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
            let url = `/admin/products/${this.object_id}/images/${new_image.id}.json`;
            this._http.put(url, {image: data})
                .subscribe((data) => {
                    this.getAPIImage(Object.assign({image: old_image}, data));
                }, (err) => {});
        } else {
            this.images.push(new_image);
            this.api_images.push(new_image);
            this.images.sort((a, b) => {return a.position-b.position;}); 
        }
    }

    // save after feather edition
    saveImage(imageID, newURL) {
        let image = this.find(this.images, 'id', imageID);
        image.src = newURL;
        image.attachment = undefined;
        image.type = 'src';
        this.featherEditor.close();
        if (imageID > 0) {
            let url = `/admin/products/${this.object_id}/images/${imageID}.json`;
            this._http.put(url, {image: {src: newURL}})
                .subscribe(
                    (data) => {
                        image.src = data.image.src;
                        image.id = data.image.id;
                    },
                    (err) => {}
                );
        }
    }

    saveImages() {
        let old_image = {};
        let images = this.images.slice(0);
        this.images = [];

        images.forEach((image) => {
            old_image = this.find(this.api_images, 'id', image.id);
            if (old_image) {
                this.updateImage(image, old_image);
            } else {
                this.addImage(image.src || image.attachment, image.type, image.position);
            }
        });
        this.formChange = false;
    }

    editImage(id) {
        let img_id = String(id);
        let img = document.getElementById(img_id);
        if (id < 0) {
            this.featherEditor.launch({image: img_id, url: img.src});
            return false;
        }
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = () => {
            var reader = new FileReader();
            reader.onloadend = () => {
                this.featherEditor.launch({image: img_id, url: reader.result});
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

//----------------------------------------------------------------------Options
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

//----------------------------------------------------------------------Variants

    deleteVariants() {
        this.bulkVariants.forEach((variant) => {
            let id = variant.id
            this._http.delete(`/admin/products/${this.object_id}/variants/${id}.json`)
                .subscribe(
                () => {
                    this.splice(this.variants, 'id', id);
                    this.splice(this.api_variants, 'id', id);
                    this.formChange = true;
                    this._admin.notNavigate = true;
                }, 
                (err) => {}
            );
        });
    }

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

    saveVariants() {
        let api_variants = this.api_variants.slice(0);
        let variants = [];
        this.api_variants= [];
        let old_variant = {};

        // delete unselected variants
        this.variants.forEach((variant, index) => {
            if (variant.select) {
                variant['position'] = index + 1;
                variants.push(variant);
            }
        });
        this.variants= [];

        variants.forEach((variant) => {
            old_variant = this.find(api_variants, 'id', variant.id);
            if (old_variant) {
                this.updateVariant(variant, old_variant);
            } else {
                this.newVariant(variant);
            }
        });
        this.formChange = false;
    }

    // get variant from api data
    getAPIVariant(data) {
        data.variant['select'] = 0;
        this.variants.push(data.variant);
        this.api_variants.push(data.variant);
        this.variants.sort((a, b) => {return a.position-b.position;}); 
    }

    // add new variant
    newVariant(variant) {
        delete variant.select;
        let url = `/admin/products/${this.object_id}/variants.json`;
        this._http.post(url, {variant: variant})
            .subscribe((data) => {this.getAPIVariant(data);}, (err) => {});
    }


   // update variant if it necessary
    updateVariant(new_image, old_image) {
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

    getBulk() {
        this.bulkVariants = [];
        this.variants.forEach((v) => {
            if (v.select) {
                this.bulkVariants.push(v);
            };
        });
    }

    countSelectedVariants() {
        let count = this.variants.filter((v) => {return v.select;}).length;
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

//------------------------------------------------------------------bulkActions
    onBulkUpdateImage() {
        this.showBulkUpdateImages=true;
        this.bulkImagesPage=0;
        this.bulkCurrentImage=undefined;
        this.hidePopovers();
    }

    bulkImagesRemove() {
        this.bulkVariants.forEach((variant) => {
            variant.image = null; 
        });
        this.showBulkUpdateImages = false;
    }

    bulkImageSave(id) {
        let image = this.find(this.images, 'id', id)
        this.bulkVariants.forEach((variant) => {
            variant.image = image; 
        });
        this.showBulkUpdateImages = false;
    }


    bulkImagesNextPage() {
        this.bulkCurrentImage = undefined;
        this.bulkImagesPage++;
    }

    bulkImagesPrevPage() {
        this.bulkCurrentImage = undefined;
        this.bulkImagesPage--;
    }

    onPopover(event, popover){
        this.showCalendar = false;
        event.preventDefault();
        event.stopPropagation();
        this.switchPopover(popover);
        this.hidePopovers(popover);
    }

    hidePopover(popover) {
        let el = this.getByID(popover);
        if (el && el.classList.contains('show')) {
            el.classList.remove('show');
            el.classList.add('hide');
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
        let el = this.getByID(popover);
        if (el) {
            let show = el.classList.contains('hide');
            el.classList.remove(show ? 'hide' : 'show');
            el.classList.add(show ? 'show' : 'hide');
            if (show) {
                let event = new Event('show');
                el.dispatchEvent(event);
            }
        }
    }

    getId(){
        return Math.floor(Math.random() * 1000);
    }

    onShowCalendar(event) {
        event.preventDefault();
        event.stopPropagation();
        this.showCalendar = !this.showCalendar;
    }
    publeshedChange(d) {
        this.formChange = true;
        this._admin.notNavigate = true;
        this.published_at[0] = d.toISOString().split('T')[0];

        let date = new Date().toISOString().split('T')[0];
        let hm = new Date().toISOString().split('T')[1].split(':').slice(0,2);
        if (this.published_at[0] === date) {
            this.times = this._times.filter(val => {
                let t = val.split(' ')[0].split(':');
                let apm = val.split(' ')[1];
                t[0] = Number(t[0]);
                t[1] = Number(t[1]);
                if (apm === 'pm') {
                    t[0] += 12;
                }
                let ret = hm[0] < t[0] || (hm[0] === t[0] && hm[0] < t[0]);
                return ret;
            }).slice();
        } else if (this.published_at[0]) {
            this.times = this._times.slice(0);
        } else {
            this.times = [];
        }
    }

    publishedTimeChage(time) {
        this.formChange = true;
        this._admin.notNavigate = true;
        this.published_at[1]=time;
        this.hidePopovers();
    }

    getTimes(event) {
        if (this.times.length) {
            this.onPopover(event, 'publish_time');
        }
    }
}

//------------------------------------------------------------------------------AdminProductsEdit 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new-edit.html',
  interpolation: ['[[', ']]'],
  directives: [RichTextEditor, AdminLeavePage, Popover],
})
export class AdminProductsEdit extends AdminProductsNew {
}


//------------------------------------------------------------------------------AdminProductsModule
@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule,
        AdminComponentsModule,
    ],
    providers: [
    ],
    declarations: [
        AdminCollections,
        AdminTransfers,
        AdminProducts,
        AdminProductsNew,
        AdminProductsEdit
    ]
})
export class AdminProductsModule {}

