import 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
    Validators } from '@angular/forms';
import { Http } from '@angular/http';
import { NgModule, Component, ViewContainerRef } from '@angular/core';
import { Router, Routes, ActivatedRoute } from '@angular/router';

import { DragulaModule, DragulaService } from 'ng2-dragula/ng2-dragula';

import { AdminComponentsModule, PopUpMenuCollection} from './components';
import { Admin } from './admin';
import { AdminAuthService, AdminUtils } from './admin.auth';
import { BaseForm } from './admin.baseform';


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
    ngOnInit() {this._admin.currentUrl(); this._admin.headerButtons = [];}
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
})
export class AdminProductsNew extends BaseForm {
    menus = new PopUpMenuCollection;

    state = ''
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
    published_at = null;
    published_at_date = null;
    published_at_time = null;
    times = [];
    _times = [];

    product_types = [];
    vendors = [];

    collects = [];
    collections = [];
    _collections = [];
    search_collection = '';

    tags = [];
    all_tags = [];
    all_tags_statistic = [];

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [ActivatedRoute],
                [AdminAuthService], [Admin], [AdminUtils], [ViewContainerRef],
                [DragulaService]];
    }

    constructor(http, fb, router, params, auth, admin, utils, vcr, dragula) {
        super(http, fb, router, auth, admin, utils);
        this._vcr = vcr;
        this.object_id = params.snapshot.params.id;
        this.model = 'product';
        this.currentLink = '/product/new';
        this.cancelLink = '/products';
        this.dragula = dragula;
    }

    ngOnDestroy() {
        // for child components onDestroy isn't called automatically
        if (this.rich_text_editor) {
            this.rich_text_editor.ngOnDestroy();
        }

        this.dragula.destroy('images');

        window.removeEventListener('dragenter', this.disableDrop, false);
        window.removeEventListener('dragover', this.disableDrop, false);
        window.removeEventListener('dragleave', this.dragLeave, false);
        window.removeEventListener('dragstart', this.disableDrag, false);
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

        // Image Editor (apiKey: ???)
        let self = this;
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

        // drag and drop
        this.dragula.shadow.subscribe(this.shadowImage.bind(this));
        this.dragula.drop.subscribe(this.dropImage.bind(this));
        this.dragula.dragend.subscribe(this.dragEnd.bind(this));


        let options = {
            revertOnSpill: false,
            removeOnSpill: false,
            moves: (el, source) => {
                let ret = !!(el.dataset && el.dataset['dragzone']);
                return ret;
            },
            copy: false,
            copySortSource: true,
        }
        this.dragula.setOptions('images', options);
        this.drake = this.dragula.find('images').drake;

        // disable dragover and drop 
        window.addEventListener('dragenter', this.disableDrop.bind(this), false);
        window.addEventListener('dragover', this.disableDrop.bind(this), false);
        window.addEventListener('dragleave', this.dragLeave.bind(this), false);
        window.addEventListener('dragstart', this.disableDrag.bind(this), false);

        this.date_locale = moment.locale(navigator.language);
        this.date_format = moment.localeData(this.date_locale).longDateFormat('L');

        for (let i = 0; i < 24; i++) {
            this._times.push({title: `0${i}:00`.slice(-5)});
            this._times.push({title: `0${i}:30`.slice(-5)});
        }
    }

    addFormAfter() {
        if (this.object_id) {
            this.getAPIDataAll(
                [
                    `/admin/products/${this.object_id}.json`,
                    `/admin/products/${this.object_id}/images.json`,
                    `/admin/products/${this.object_id}/variants.json?limit=100`,
                    '/admin/custom_collections.json?fields=title,id',
                    `/admin/collects.json?product_id=${this.object_id}`,
                    '/admin/products/tags.json',
                ],
                [
                    'getProductAfter',
                    'getImagesAfter',
                    'getVariantsAfter',
                    'getCollectionsAfter',
                    'getCollectsAfter',
                    'getTagsAfter',
                ]
            );
        } else {
            this.getAPIData(
                [
                    '/admin/custom_collections.json?fields=title,id',
                    '/admin/products/tags.json',
                ],
                [
                    'getCollectionsAfter',
                    'getTagsAfter',
                ]
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

        this.showPublishedAt = false;
        if (data.product.published_at) {
            this.published_at = moment(data.product.published_at);
            this.published_at_date = this.published_at.format(this.date_format);
            this.published_at_time = this.published_at.format('HH:mm');
            this.refreshTimes();
            this.online_store = 0;
            if (this.published_at.diff(moment()) < 0) {
                this.online_store = 1;
            }
        } else {
            this.online_store = 1;
        }
        this.tags = product.tags.slice(0).sort(); //for TagsEsit
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
        this.images = this.copy(images);
        this.api_images = this.copy(images);
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
        this.variants = this.copy(variants);
        this.api_variants = this.copy(variants);
    }

    getCollectionsAfter(data){
        this._collections = [];
        this.api_collections = [];
        data.custom_collections.forEach(v => {
            this._collections.push(
                {title: v.title, id: v.id, select: false, idd: 0}
            );
        });
        this.api_collections = this.copy(this._collections);
    }

    getCollectsAfter(data) {
        this._collections = this.copy(this.api_collections);
        this.collects = data.collects;
        
        this.api_collections.forEach(val => {
            let v = this.find(this.collects, 'collection_id', val.id);
            val.select = v;
            if (v) {
                val.select = true;
                val.idd = v.id
            } else {
                val.select = false;
                val.idd = 0;
            }
        });
        this._collections = this.copy(this.api_collections);
    }

    getTagsAfter(data) {
        this.all_tags_statistic = data.tags;//for child
        this.all_tags = [];
        for (let i in this.all_tags_statistic) {
            this.all_tags.push(this.all_tags_statistic[i][0]);
        }
    }


    changeRTE(body_html) {
        this.form[this.model].value['body_html'] = body_html;
        this.onFormChange();
    }

    onFormChange() {
        let b1 = this.compare(this.form[this.model].value, this.api_data[this.model])
        let b2 = this.compareArray(this.api_collections, this._collections);
        let b3 = this.compareArrayUnsort(this.form[this.model].value.tags, this.tags);
        this.formChange = !(b1 && b2 && b3);
        this._admin.notNavigate = this.formChange;
    }

    onSave() {
        if(!this.groupValidate(this.form, 'product')) return;
        let product = {};
        product['product'] = this.form['product'].value;
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

        if (this.published_at) {
            product.product['published_at'] = this.published_at.toDate();
        } else {
            product.product['published_at'] = null;
        }

        product.product['tags'] = this.tags

        if (!this.object_id) {
            this._http.post('/admin/products.json', product )
                .subscribe(
                    (data) => {
                        this.object_id = data.product.id;
                        this.saveCollections();
                        this.getProductAfter(data);
                        this.saveImages();
                        this.saveVariants();
                        this.getAPIData(['/admin/customers/tags.json'], ['getTagsAfter']);
                    },
                    (err) => {this.apiErrors(this.form, 'product', err.json());}
                );
        } else {
            this._http.put(`/admin/products/${this.object_id}.json`, product)
                .subscribe(
                    (data) => {
                        this.saveCollections();
                        this.getProductAfter(data);
                        this.saveImages();
                        this.saveVariants();
                        this.getAPIData(['/admin/customers/tags.json'], ['getTagsAfter']);
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
    shadowImage(args) {
        let el = args[2];
        if(el.dataset && el.dataset.variant) {
            this.currentVariant = el.dataset.variant;
        } else {
            this.currentVariant = undefined;
        }
    }

    dropImage(args) {
        let image = args[1];
        let variant = args[2];
        if (
            (image.dataset && image.dataset.image) &&
            (variant.dataset && variant.dataset.variant)
        ) {
            let var_ = this.find(this.variants, 'id', variant.dataset.variant);
            let img = this.find(this.images, 'id', image.dataset.image);
            Object.assign(var_, {image: img});
            this.drake.cancel(true);
        }
    }

    //dragula event
    dragEnd() {
        this.currentVariant = undefined;
        this.refreshImagesFromDOM();
        this.formChange = true;
        this._admin.notNavigate = true;
    }

    //window event
    disableDrag(evt) {
        if (!(evt.target.dataset && evt.target.dataset['dragzone'])) {
            evt.preventDefault();
            return false;
        }
        return true
    }

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
                this.addImage(evt.target.result, 'attachment');
            };
            reader.readAsDataURL(files[i]);
        }
        event.target.files = null;
        this.formChange = true;
        this._admin.notNavigate = true;
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
            this.formChange = true;
            this._admin.notNavigate = true;
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
        let img = window.document.querySelector(`#images [id='${imageID}']`);
        this.imagePreviewSrc = img.src;
        this.showImagePreview = true;
    }

    editAltText(imageID) {
        this.currentImage = window.document.querySelector(`#images [id='${imageID}']`);
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
        let dom_images = window.document.querySelectorAll('#images img');
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
        let images = this.copy(this.images);
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
        let api_variants = this.copy(this.api_variants);
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
        this.menus.hideAll();
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

    getId(){
        return Math.floor(Math.random() * 1000);
    }

//----------------------------------------------------------------published date
    onShowCalendar(event) {
        event.preventDefault();
        event.stopPropagation();
        this.showCalendar = !this.showCalendar;
        this.menus.hideAll();
    }

    publishedCheck() {
        let cls = {'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0};
        if (this.published_at.isValid()) {
            this.published_at.set(cls);
            let diff = this.published_at.diff(moment().set(cls));
            if (diff < 0) {
                this.published_at_time = null;
                this.published_at = null;
            } else if (diff == 0) {
                this.published_at = moment();
                this.published_at_time = this.published_at.format('HH:mm');
                this.published_at_date = this.published_at.format(this.date_format);
            } else {
                this.published_at_time = this.published_at.format('HH:mm');
                this.published_at_date = this.published_at.format(this.date_format);
            }
        } else {
            this.published_at = null;
            this.published_at_time = null;
        }
        this.refreshTimes()
        if (this.published_at) {
            this.online_store = 0;
            this.formChange = true;
            this._admin.notNavigate = true;
        } else {
            this.online_store = 1;
        }
    }

    publeshedDateChange(date) {
        this.published_at = moment(date);
        this.publishedCheck();
    }

    publeshedDateInput() {
        this.showCalendar = false;
        this.published_at = moment(this.published_at_date, this.date_format, true);
        this.publishedCheck();
    }

    refreshTimes() {
        if (!this.published_at) {
            this.times = [];
            return;
        }
        let d = moment();
        let date = d.format(this.date_format);
        let hh = d.format('HH');
        let mm = d.format('mm');

        let h, m;
        if (this.published_at.format(this.date_format) === date) {
            this.times = this._times.filter(val => {
                [h, m] = val.title.match(/^(\d\d):(\d\d)/).slice(1,3);
                return hh < h || (hh == h && mm < m);
            }).slice(0);
        } else if (this.published_at_date) {
            this.times = this._times.slice(0);
        } else {
            this.times = [];
        }
    }

    publishedTimeChage(time) {
        this.published_at_time = time.title;
        this.publishedTimeInput();
        this.menus.hideAll();
    }

    publishedTimeInput() {
        let hm = this.published_at_time.match(/^(\d\d):(\d\d)/);
        if (hm) {
            this.published_at = moment(this.published_at_date, this.date_format, true);
            this.published_at.set({'hour': hm[1], 'minute': hm[2], 'second': 0, 'millisecond': 0});
            if (this.published_at.diff(moment()) < 0) {
                this.published_at = null;
            }
        } else {
            this.published_at = null;
        }
        if (this.published_at) {
            this.online_store = 0;
            this.formChange = true;
            this._admin.notNavigate = true;
        } else {
            this.online_store = 1;
        }
    }

    getTimes(event) {
        this.showCalendar = false;
        if (this.times.length) {
            this.menus.onSwitch(event, 'publish-time');
        }
    }

    onChangeOnlineStore(flag) {
        this.showPublishedAt = false;
        if (flag) {
            this.published_at = moment();
            this.published_at_time = this.published_at.format('HH:mm');
            this.published_at_date = this.published_at.format(this.date_format);
        } else {
            this.published_at = null;
            this.published_at_date = null;
            this.published_at_time = null;
        }
        this.refreshTimes();
        this.formChange = true;
        this._admin.notNavigate = true;
    }

    onCancelPublishedAt() {
        this.online_store = 0;
        this.published_at = null;
        this.published_at_date = null;
        this.published_at_time = null;
        this.showPublishedAt = false;
        this.formChange = true;
        this._admin.notNavigate = true;
    }


//------------------------------------------------------------------Product Type
    getTypes(event) {
        this.showCalendar = false;
        if (this.menus.onSwitch(event, 'product-types')) {
            this.getAPI('/admin/products.json?fields=product_type', (data) => {
                this.product_types = [];
                data.products.forEach(v => {
                    if (v.product_type && this.product_types.indexOf(v.product_type) === -1) {
                        this.product_types.push({title: v.product_type});
                    }
                    if (!this.product_types.length) {
                        this.menus.hide('product_types')
                    }
                });
            });
        }
    }

    productType(type) {
        this.form.product.controls['product_type'].setValue(type.title);
        this.formChange = true;
        this._admin.notNavigate = true;
        this.menus.hide('product_type');
    }

//------------------------------------------------------------------------Vendor
    getVendors(event) {
        this.showCalendar = false;
        if (this.menus.onSwitch(event, 'vendors')) {
            this.getAPI('/admin/products.json?fields=vendor', (data) => {
                this.vendors = [];
                data.products.forEach(v => {
                    if (v.vendor && this.vendors.indexOf(v.vendor) === -1) {
                        this.vendors.push({title: v.vendor});
                    }
                });
                if (!this.vendors.length) {
                    this.menus.hide('vendors');
                }  
            });
        }
    }

    productVendor(vendor) {
        this.form.product.controls['vendor'].setValue(vendor.title);
        this.formChange = true;
        this._admin.notNavigate = true;
        this.menus.hide('vendors');
    }

//--------------------------------------------------------------------Collection
    getCollections(event) {
        this.showCalendar = false;
        if (this._collections.length) {
            this.collections = this._collections;
            this.menus.onSwitch(event, 'collections')
        }
    }

    onSearchCollections(event, search) {
        this.showCalendar = false;
        if(
            !['Enter', 'NumpadEnter', 'ArrowUp', 'ArrowDown', 'Escape']
            .includes(event.code)
        ) {
            this.collections = this._collections.filter( 
                el => {
                    return el.title.startsWith(search);
                }
            );
            this.menus.show('collections');
        } 
    }

    selectCollection(item) {
        item.select = !item.select;
        event.stopPropagation();
        event.preventDefault();
        this.onFormChange();
    }

    saveCollections() {
        let p = 1;
        let requests = [];
        let data = {collect: {}};

        for (let i = 0; i < this._collections.length; i++) {
            if (this._collections[i].select != this.api_collections[i].select) {
                if (this._collections[i].select) {
                    data.collect = {
                        product_id: this.object_id,
                        collection_id: this._collections[i].id,
                        position: p++
                    };
                    requests.push(this._http.post('/admin/collects.json', data));
                } else {
                    requests.push(this._http.delete(`/admin/collects/${this._collections[i].idd}.json`));
                }
            } else if (this._collections[i].select) {
                data.collect = {id: this._collections[i].idd, position: p++};
                requests.push(this._http.patch(`/admin/collects/${this._collections[i].idd}.json`, data ));
            }
        }
        Observable.forkJoin(requests).subscribe(
            () => {
                this.getAPI(
                    `/admin/collects.json?product_id=${this.object_id}`,
                    this.getCollectsAfter
                );
            },
            err => {
                try {
                    this.errors = this._utils.to_array(err.json());
                } catch(e) {
                    console.log(err, e);
                }
            }
        );
    }

    saveTags() {
        if (this.object_id) {
            let product = {'product': {'tags': this.tags}};
            this._http
                .patch(`/admin/products/${this.object_id}.json`, product)
                .subscribe(
                    data => { 
                        this.getProductAfter(data);
                        this.getAPIData(['/admin/products/tags.json'], ['getTagsAfter']);
                    },
                    err => this.apiErrors(this.form, 'product', err.json()),
                );
            this.formChange = false;
            this._admin.notNavigate = false;
        } else {
            this.formChange = true;
            this._admin.notNavigate = true;
        }
    }
}

//------------------------------------------------------------------------------AdminProductsEdit 
@Component({
  selector: 'main',
  templateUrl : 'templates/product/new-edit.html',
  interpolation: ['[[', ']]'],
})
export class AdminProductsEdit extends AdminProductsNew {
}


//------------------------------------------------------------------------------AdminProductsModule
@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule,
        DragulaModule,
        AdminComponentsModule,
    ],
    providers: [
    ],
    declarations: [
        AdminTransfers,
        AdminProducts,
        AdminProductsNew,
        AdminProductsEdit
    ]
})
export class AdminProductsModule {}

