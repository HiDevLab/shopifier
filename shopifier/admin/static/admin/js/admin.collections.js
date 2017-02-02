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
    Calendar, Wait } from './components';


//------------------------------------------------------------------------------AdminCollections
@Component({
  selector: 'main',
  templateUrl: 'templates/collection/collections.html',
  interpolation: ['[[', ']]'],
})
export class AdminCollections extends BaseForm {

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
            'text': 'Create collection', 'class': 'btn btn-blue',
            'click': this.onAdd, 'self': this 
        });

        this.getAPIData(['/admin/custom_collections.json'], ['getCollections']);
    }

    getCollections(data) {
        this.collections = data.custom_collections;
    }

    onAdd() {
        this._router.navigate(['collections/new']);
    }

    onEditCollection(collection) {
        this.current_collection_index = this.collections.indexOf(collection);
        this._router.navigate(['/collections/', collection.id]);
    }
}


//------------------------------------------------------------------------------AdminCollectionsNew(Edit) 
@Component({
  selector: 'main',
  templateUrl : 'templates/collection/new-edit.html',
  interpolation: ['[[', ']]'],
})
export class AdminCollectionsNew extends BaseForm {
    body_html = '';

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [ActivatedRoute],
                [AdminAuthService], [Admin], [AdminUtils], [ViewContainerRef]];
    }

    constructor(http, fb, router, params, auth, admin, utils, vcr) {
        super(http, fb, router, auth, admin, utils);
        this._vcr = vcr;
        this.object_id = params.snapshot.params.id;
        this.model = 'custom_collection';
        this.currentLink = '/collection/new';
        this.cancelLink = '/collections';
    }

    ngOnDestroy() {
        // for child components onDestroy isn't called automatically
        if (this.rich_text_editor) {
            this.rich_text_editor.ngOnDestroy();
        }
    }

    ngOnInit() {
        this.self = this; // for child components
        this._admin.notNavigate = false;

        this.addForm(this.form, '/admin/custom_collections.json', 'custom_collection');

        this._admin.headerButtons = [];
        if (this.object_id) {
//             this.currentLink = 'EditProduct';   ???????????
            this._admin.currentUrl({ 'url':'#', 'text': ''}, 1);

            this._admin.headerButtons.push({
                'text': '', 'class': 'btn mr10 fa fa-chevron-left',
                'click': this.onPrev, 'self': this, 'disabled' : 'disabledPrev'
            });
    
            this._admin.headerButtons.push({
                'text': '', 'class': 'btn mr10 fa fa-chevron-right', 
                'click': this.onNext, 'self': this, 'disabled' : 'disabledNext'
            });
        } else {
            this._admin.currentUrl({ 'url':'#', 'text': 'Create collection'}, 1);
        }
        this._admin.headerButtons.push({
            'text': 'Cancel', 'class': 'btn mr10', 
            'click': this.onCancel, 'self': this 
        });
        this._admin.headerButtons.push ({
            'text': 'Save collection', 'class': 'btn btn-blue', 
            'click': this.onSave, 'primary': true, 'self': this 
        });
    }

    addFormAfter() {
        if (this.object_id) {
            this.getAPIData(
                [`/admin/custom_collections/${this.object_id}.json`,],
                ['getCollectionAfter']
            );
        }
    }

    onFormChange() {
        this.form[this.model].value['body_html'] = this.body_html;
        this.formChange = !this.compare(
            this.form[this.model].value,
            this.api_data[this.model]
        );
        this._admin.notNavigate = this.formChange;
    }

    getCollectionAfter(data) {
        this.api_data = data;
        this.setDataToControls(this.form, this.model, this.api_data[this.model]);
        this.body_html = data[this.model].body_html;
        if (this.rich_text_editor) {
            this.rich_text_editor.editor.setValue(this.body_html, false);
            window.focus();
            this.formChange = false;
        }
        let title = this.api_data.custom_collection.title;
        this._admin.currentUrl({'url': '#', 'text': `${title}`}, 1);

        this.disabledNext = undefined;
        this.disabledPrev = undefined;
    }

    onSave() {
        if(!this.groupValidate(this.form, this.model)) return;
        let data = {};
        data[this.model] = this.form[this.model].value;

        if (!this.object_id) {
            this._http.post('/admin/custom_collections.json', data)
                .subscribe(
                    (data) => {
                        this.object_id = data[this.model].id;
                        this.getCollectionAfter(data);
                    },
                    (err) => {this.apiErrors(this.form, this.model, err.json());}
                );
        } else {
            this._http.put(`/admin/custom_collections/${this.object_id}.json`, data)
                .subscribe(
                    (data) => {
                        this.getCollectionAfter(data);
                    },
                    (err) => {this.apiErrors(this.form, this.model, err.json());}
                );
        }
    }
}


//------------------------------------------------------------------------------AdminCollectionsEdit 
@Component({
  selector: 'main',
  templateUrl : 'templates/collection/new-edit.html',
  interpolation: ['[[', ']]'],
})
export class AdminCollectionsEdit extends AdminCollectionsNew {
}

//------------------------------------------------------------------------------AdminCollectionsModule
@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule,
        AdminComponentsModule,
    ],
    providers: [
    ],
    declarations: [
        AdminCollections,
        AdminCollectionsEdit,
        AdminCollectionsNew
    ]
})
export class AdminCollectionsModule {}
