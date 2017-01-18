import { CommonModule } from '@angular/common';
import { NgModule, Component, ViewContainerRef } from '@angular/core';
import { Http } from '@angular/http';
import { Router, Routes, ActivatedRoute, RouteParams } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/Rx';

import { AdminAuthService, AdminUtils } from './admin.auth';
import { Admin } from './admin';
import { BaseForm } from './admin.baseform';
import { AdminComponentsModule } from './components';


//------------------------------------------------------------------------------AdminAccountProfile
export var Permissions = [
    {
        group: 'General',
        permissions: 
        [
            {name: 'Home', api: 'home', select: 0},
            {name: 'Orders', api: 'orders', select: 0},
            {name: 'Customers', api: 'customers', select: 0},
            {name: 'Discounts', api: 'discounts', select: 0},
            {name: 'Products', api: 'products', select: 0},
            {name: 'Transfers', api: 'transfers', select: 0},
            {name: 'Inventory', api: 'inventory', select: 0},
            {name: 'Collections', api: 'collections', select: 0},
            {name: 'Gift cards', api: 'gift_cards', select: 0},
            {name: 'Reports', api: 'reports', select: 0},
        ],
    },
    {
        group: 'Configuration',
        permissions: 
        [
            {name: 'Applications', api: 'applications', select: 0},
            {name: 'Settings', api: 'settings', select: 0},
            {name: 'Domains', api: 'domains', select: 0},
        ],
    },
    {
        group: 'Sales channels',
        permissions: 
        [
            {name: 'Overviews', api: 'overviews', select: 0},
            {name: 'Blog Posts & Pages', api: 'pages', select: 0},
            {name: 'Navigation', api: 'navigation', select: 0},
            {name: 'Themes', api: 'themes', select: 0},
            {name: 'Locations', api: 'locations', select: 0},
            {name: 'Order Creation', api: 'order_creation', select: 0},
        ]
    }
]


@Component({
    selector : 'profile',
    templateUrl: 'templates/account/profile.html',
})
export class AdminAccountProfile extends BaseForm {
    user = undefined;
    sessions = [];
    new_avatar = null;
    
    emailChange = false;
    passwordChange = false;
    confirmPassword = false;
    expireSessions = false;
    showSetAdmin = false;

    log_out_mobile = 0;
    admin_password = '';
    
    isUser = false;    //currentUser is this user
    isAdmin = false;    //currentUser is admin

    full_permissions = 1;
    permissions = [];

    delete_user = null;

    static get parameters() {
        return [[Http], [FormBuilder], [Router], [ActivatedRoute],
                [AdminAuthService], [Admin], [AdminUtils], [ViewContainerRef]];
    }

    constructor(http, fb, router, params, auth, admin, utils, vcr) {
        super(http, fb, router, auth, admin, utils, vcr);
        this.object_id = params.snapshot.params.id;
        this.vcr = vcr;
        this.model = 'user';
        this.currentLink = '/settings/account';
        this.cancelLink = '/settings/account';
    }

    ngOnInit() {
        this.self = this; // for child components
        this._admin.notNavigate = false;

        this.addForm(this.form, `/admin/users/${this.object_id}.json`, 'user');

        this.getSessions(this.object_id);
        this._auth.getCurrentUser().then(data => this.currentUser = data);
    }

    addFormAfter() {
        this.getAPIData([`/admin/users/${this.object_id}.json`],
            ['getUserAfter']
        );
    }

    getUserAfter(data) {
        this.settings = JSON.parse(this._admin.settings);
        this.api_data = data;
        this.setDataToControls(this.form, 'user', this.api_data.user);
        this.user = this.api_data.user;
        this.getPermissions();

        this.disabledNext = undefined;
        this.disabledPrev = undefined;

        this.new_avatar = null;
        this.emailChange = false;
        this.passwordChange = false;
        this.confirmPassword = false;
        this.expireSessions = false;
        this.showSetAdmin = false;

        this.isUser = this.user.id == this._auth._currentUser.id;// no correct
        this.isAdmin = this._auth._currentUser.is_admin;

        ['password1', 'password2', 'admin_password'].forEach((control) => {
            this.form.user.controls[control].setValue('');
        }, this);

        this._admin.currentUrl({
            'url':'#', 'text': `${this.user.first_name} ${this.user.last_name}`
        }, 2);

        this._admin.headerButtons = [];
        if (this.isAdmin && !this.isUser) {
            if (!this.user.is_admin) {
                this._admin.headerButtons.push({
                    'text': 'Make this user the account owner', 
                    'class': 'btn mr10', 'click': this.setAdmin, 'self': this 
                });
            }
            else {
                this._admin.headerButtons.push({
                    'text': 'Take away this user the account owner permissions',
                    'class': 'btn mr10', 'click': this.setAdmin, 'self': this
                });
            }
        }

        this._admin.headerButtons.push({
            'text': 'Cancel', 'class': 'btn mr10', 
            'click': this.onCancel, 'self': this 
        });
        this._admin.headerButtons.push ({
            'text': 'Save', 'class': 'btn btn-blue', 
            'click': this.onSave, 'primary': true, 'self': this 
        });
    }

    clsPermissions() {
        this.permissions.forEach((group) => {
            group.permissions.forEach((permission) => {
                permission.select = 0;
            });
        });
    }

    getPermissions() {
        this.permissions = Permissions.slice(0);
        if (this.user.permissions[0] === 'full') {
            this.full_permissions = 1;
        } else {
            this.full_permissions = 0;
            for (let group of this.permissions) {
                for (let permission of group.permissions) {
                    if (this.user.permissions.indexOf(permission.api) === -1) {
                        permission.select = 0;
                    } else {
                        permission.select = 1;
                    }
                }
            }
        }
    }

    setPermissions() {
        let out = [];
        if (this.full_permissions) {
            out.push('full');
        } else {
            this.permissions.forEach((group) => {
                group.permissions.forEach((permission) => {
                    if(permission.select) {
                        out.push(permission.api);
                    }
                });                    if (this.isUser) {
                        this._admin.refreshCurrentUser();
                    }

            });
        }
        return out;
    }

    onSave() {
        if (
                this.form.user.controls['email'].value != this.user.email || 
                this.form.user.controls['password1'].value ||
                this.form.user.controls['password2'].value
            ){
                this.admin_password = '';
                this.confirmPassword = true;
        }
        else {
            this.onSaveAdmin();
        }
    }
    
    onSaveAdmin() { // admin permissions
        if(!this.groupValidate(this.form, 'user')) return;
        let data = Object.assign({}, this.form.user.value);
        if (
                this.form.user.controls['password1'].value ||
                this.form.user.controls['password2'].value) {
            data['admin_password'] = this.admin_password;
        } else {
            delete data['admin_password'];
            delete data['password1'];
            delete data['password2'];
        }

        if (this.new_avatar) {
            data['avatar_image'] = this.new_avatar;
        } else {
            delete data['avatar_image'];
        }
        data.permissions = this.setPermissions();
        
        this._http.patch(`/admin/users/${this.object_id}.json`, { user: data })
            .subscribe(
                (data) => {
                    if (this.isUser) {
                        this._admin.refreshCurrentUser();
                    }
                    this.getUserAfter(data);
                },
                (err) => this.apiErrors(this.form, 'user', err.json()), 
            );
            this.formChange = false;
            this._admin.notNavigate = false;
    }

    setAdmin() {
        this.showSetAdmin = true;
    }

    addOwnership() {
        this.user.is_admin = !this.user.is_admin;
        let data = {is_admin: this.user.is_admin, permissions: ['full']};
        this._http.patch(`/admin/users/${this.object_id}.json`, { user: data })
            .subscribe(
                (data) => {
                    this.getUserAfter(data);
                },
                (err) => {
                    this.apiErrors(this.form, 'user', err.json());
                }
            );
    }

    upLoadAvatar(event) {
        let files = event.target.files;
        if (files && files[0]) {
            let reader = new FileReader();
            let self = this;
            
            reader.onload = (event) => {
                self.new_avatar = event.target.result;
                self.formChange = true;
                self._admin.notNavigate = true;
            };
            reader.readAsDataURL(files[0]);
        }
    }

    deleteAvatar() {
        if (this.user.avatar) {
            this.formChange = true;
            this._admin.notNavigate = true;
        }
        this.new_avatar = null;
        this.user.avatar = null;
        this.controls['avatar_image'].setValue(null);
    }

    deleteAccount() {
//         let factory = this._cfr.resolveComponentFactory(AdminAccountDelete);
//         let ref = this._vcr.createComponent(factory);
//         ref.instance.parent = this;
//         ref.changeDetectorRef.detectChanges();
// @NgModule({ entryComponents: [ AdminAccountDelete,]}]

           this._utils.openDialog(this, this.vcr, 'templates/account/delete.html')
                .then(
                (result) => {
                    this._http.delete(`/api/admin/${this.user.id}/`)
                        .subscribe(
                            (data) => { 
                                this._admin.footer(`${this.user.first_name} ${this.user.last_name} has been removed`);
                            },
                            (err) => {}, 
                            () => this.onCancel()
                        );
                },
                (reason) => {
                }
           );
    }


    getSessions(id) {
        this._http.get(`/api/admin/${id}/session/`)
            .subscribe((data) => {
                this.sessions = data;
            }
        );
    }

    deleteSessions() {
        this._http.delete(`/api/admin/${this.user.id}/deletesession/`)
            .subscribe(() => this.getSessions(this.user.id));
    }

    setDate (date) {
        let d = new Date(date);
        return d;
    }
}

//------------------------------------------------------------------------------AdminAccountDeleteSessions
@Component({
    selector : 'sessions',
    templateUrl: 'templates/account/del-sessions.html',
})
export class AdminAccountDeleteSessions {
    show = false;
    parrent = null;
    errors = [];
    obj_errors = {};
    
    static get parameters() {
        return [[Http], [Admin]];
    }
    constructor(http, admin) {
        this._http = userRefreshhttp;
        this._admin = admin;
        
    }
    
    goDeleteSessions() {
        this._http.delete('/api/sessions-expire/')
                .subscribe( () => {},
                            () => {}, 
                            () =>  {
                                this.show=false;
                                this._admin.footer('You have successfully logged out all users');
                            } 
                 );
    }   
}


//------------------------------------------------------------------------------AdminAccountInvite
@Component({    
    selector : 'account_invite',
    templateUrl: 'templates/account/invaite.html',
    inputs: ['parent', 'self']
})
export class AdminAccountInvite {
    show = false;
    errors = [];
    obj_errors = {};
    first_nameErr = true;
    formChange = false;
    
    static get parameters() {
        return [[Http], [FormBuilder], [AdminUtils], [Admin]];
    }
    constructor(http, formbuilder, utils, admin) {
        this._http = http;
        this._utils = utils;
        this._admin = admin;
        this.form = formbuilder.group({
            'email': ['', this._utils.emailValidator],
            'first_name': ['', Validators.required],
            'last_name': ['', Validators.required],
        }); 
    }

    ngOnInit() {
        this.parent[this.self] = this;
    }

    goInvite () {
        this._http.post('/api/user-invite/', this.form.value)
            .subscribe( 
                (data) => { 
                    this.show = false;
                    this._admin.footer(`${this.form.value.first_name} ${this.form.value.last_name} has been invited`);
                },
                (err) => { 
                    this.obj_errors = err.json();
                    this.errors = this._utils.to_array(err.json());
                }, 
                () => this.parent.userRefresh() 
        );
    }

    cls () {
        this.form.reset();
        this.formChange = false;
        this.obj_errors = {};
        this.errors = [];
    }
}


//------------------------------------------------------------------------------AdminAccount
@Component({ selector: 'main', templateUrl: 'templates/account/account.html' })
export class AdminAccount {
    currentUser = null;
    users = [];

//modal
    invite_user = null;
    delete_sessions = null;
        
    static get parameters() {
        return [[Http], [AdminAuthService], [FormBuilder], [Router], [Admin]];
    }
     
    constructor(http, authService, formbuilder, router, admin) {
        this._http = http;
        this._router = router;
        this._auth = authService;
        this._admin = admin;
    }

    ngOnInit() {
        this._admin.currentUrl();
        
        this._http.get('/api/admin/')
            .subscribe( data => this.users = data ); 
        
        this._auth.getCurrentUser().then(data => this.currentUser = data );
        this._admin.headerButtons = [];
//         this.dcl.loadNextToLocation(AdminAccountDeleteSessions,  this.viewContainerRef)
//             .then((compRef)=> {
//                 this.delete_sessions = compRef.instance;
//                 this.delete_sessions.parrent = this; 
//             });    
    }
        
    setDate (date) {
        let d = new Date(date);
        return d;
    }
    
    goInvite() {
        this.invite_user.show = true;
        this.invite_user.cls();
    }

    goDeleteSessions() {
        this.delete_sessions.show = true;
    }
    
    goProfile(user) {
        let link;
        if (user.token && this.currentUser.is_admin) {
             link = ['/auth/accept', user.id, user.token];
        } else {
            link = ['/settings/account', user.id];
        }
        this._router.navigate(link);
    }
    
    userRefresh() {
       this._http.get('/api/admin/').subscribe( data => this.users = data );
    }
}


//------------------------------------------------------------------------------AdminSettingsGeneral
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminSettingsGeneral {
    component = 'General';
    static get parameters() {return [[Admin]];}
    constructor(admin) {
        this._admin = admin;
    }
    ngOnInit() {this._admin.currentUrl();}
}

//------------------------------------------------------------------------------AdminSettingsCheckout
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminSettingsCheckout {
    component = 'Checkout';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------AdminSettingsModule
@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule,
        AdminComponentsModule
    ],
    providers: [
    ],
    declarations: [
        AdminAccount,
        AdminAccountInvite,
        AdminAccountProfile,
        AdminSettingsCheckout,
        AdminSettingsGeneral,
    ],
})
export class AdminSettingsModule {}
