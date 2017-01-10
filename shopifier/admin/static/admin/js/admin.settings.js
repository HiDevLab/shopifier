import { CommonModule } from '@angular/common';
import { NgModule, Component, DynamicComponentLoader, ViewContainerRef } from '@angular/core';
import { Http } from '@angular/http';
import { Router, Routes, ActivatedRoute, RouteParams } from '@angular/router'
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/Rx'

import { AdminAuthService, AdminUtils } from './admin.auth'
import { Admin } from './admin'
import { BaseForm } from './admin.baseform'
import { AdminComponentsModule } from './components';


//------------------------------------------------------------------------------AdminAccountProfile
@Component({
    selector : 'profile',
    templateUrl: 'templates/account/profile.html',
})
export class AdminAccountProfile {
    lform = undefined;
    errors = [];
    obj_errors = {};
    user = undefined;
    sessions = [];
    new_avatar = null;
    
    formChange = false;
    emailChange = false;
    passwordChange = false;
    confirmPassword = false;
    expireSessions = false;
    showSetAdmin = false;
    canDeactivate = undefined;
    
    isUser = false;    //currentUser is this user
    isAdmin = false;    //currentUser is admin

    static get parameters() {
        return [[Http], [AdminAuthService], [FormBuilder], 
            [ActivatedRoute], [Admin], [AdminUtils], [Router] ];
    }
    constructor(http, authService, formbuilder, params, admin, utils, router ) {
        this._http = http;
        this._admin = admin;
        this._params = params.snapshot.params;
        this._auth = authService;
        this._utils = utils;
        this._router = router;
        
        this.lform = formbuilder.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            phone: '123456',
            www_site: '',
            bio: '',
            avatar_image: '',
            is_admin: '',
            admin_password: '',
            password1: '',
            password2: '',
            email: ''
        });
        this.controls = this.lform.controls;
//         let ctrl = new FormControl('');
//         this.lform.addControl('email', ctrl);
    }

    ngOnInit() {
        this.self = this; // for child components
        let id = this._params.id;
        this._http
            .get(`/api/admin/${id}/`)
            .subscribe( 
                (data) => this.onInit(data),
                (err) => {
                    this.obj_errors = err; 
                    this.errors = this._utils.to_array(err.json()); 
                }, 
            ); 
        this.getSessions(id);
        this._auth.getCurrentUser().then(data => this.currentUser = data);
    }

    onInit(data) {
        this.user = data;
        this.errors = [];
        this.obj_errors = {};
        this.new_avatar = null;
        this.formChange = false;
        this._admin.notNavigate = false;
        this.emailChange = false;
        this.passwordChange = false;
        this.confirmPassword = false;
        this.expireSessions = false;
        this.showSetAdmin = false;
        this.canDeactivate = undefined;
        
        this.isUser = this.user.id == this._auth._currentUser.id;// no correct
        this.isAdmin = this._auth._currentUser.is_admin;

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
            'text': 'Save', 'class': 'btn btn-blue', 
            'click': this.onSave, 'primary': true, 'self': this
        });
        
        for (let control in this.controls) {
            if (control != 'avatar_image') {
                this.controls[control].setValue(undefined);
                this.controls[control].setValue(this.user[control]);
            }
        }
    }

    cls() {
        this.confirmPassword = false;
        for (let control in this.lform.controls) {
            if (control != 'avatar_image') {
                this.controls[control].setValue(undefined);
                this.controls[control].setValue(this.user[control]);
            }
        }
    }

    onSave() {
        if  (
                this.controls['email'].value != this.user.email || 
                this.controls['password1'].value ||
                this.controls['password2'].value
            ){
                this.controls['admin_password'].setValue('');
                this.confirmPassword = true;
        }
        else {
            this.onSaveAdmin();
        }
    }
    
    onSaveAdmin() { // admin permissions
        let data = Object.assign({}, this.lform.value); 
        
        if (this.new_avatar) {
            data['avatar_image'] = this.new_avatar;
        } else {
            delete data['avatar_image'];
        }
        this._http
            .patch(`/api/admin/${this.user.id}/`, data )
            .subscribe(
                (data) => {
                    if (this.isUser) {
                        this._admin.refreshCurrentUser();
                    }
                    this.onInit(data);
                },
                (err) => { 
                    this.obj_errors = err.json(); 
                    this.errors = this._utils.to_array(err.json());
                    this.cls();
                },
            );
    }

    setAdmin(self) {
        self.showSetAdmin = true;
    }

    addOwnership() {
        this.user.is_admin = !this.user.is_admin;
        let data = {'is_admin': this.user.is_admin};
        this._http
            .patch(`/api/admin/${this.user.id}/`, data)
            .subscribe(
                (data) => this.onInit(data),
                (err) => { 
                        this.obj_errors = err.json(); 
                        this.errors = this._utils.to_array(err.json());
                        this.cls();
                }, 
            );  
    }

    upLoadAvatar(event) {
        let files = event.target.files;
        if (files && files[0]) {
            let reader = new FileReader();
            let self = this;
            
            reader.onload = (event) => {
                self.new_avatar =  event.target.result;
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

    getSessions(id) {
        this._http
            .get(`/api/admin/${id}/session/`)
            .subscribe( data => this.sessions = data);
    }

    deleteSessions() {
        this._http
            .delete(`/api/admin/${this.user.id}/deletesession/`)
            .subscribe( () => this.getSessions(this.user.id) );
    }

    setDate (date) {
        let d = new Date(date);
        return d;
    }

    onFormChange() {
        this._admin.notNavigate = true;
        this.formChange = true;
    }
}


//------------------------------------------------------------------------------
@Component({
    selector      : 'sessions',
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
        this._http = http;
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


//------------------------------------------------------------------------------
@Component({
    selector      : 'delete',
    templateUrl: 'templates/account/delete.html',
})
export class AdminAccountDelete {
    show = false;
    parrent = null;
    user = {};
    errors = [];
    obj_errors = {};
    
    static get parameters() {
        return [[Http], [Admin]];
    }
    constructor(http, admin) {
        this._http = http;
        this._admin = admin;
    }
    
    goDelete() {
        this._http.delete(`/api/admin/${this.user.id}/`)
                .subscribe( () => { 
                                    this.show=false;
                                    this._admin.footer(`${this.user.first_name} ${this.user.last_name} has been removed`);
                                  },
                            () => {}, 
                            () => this.parrent.userRefresh() 
                 );
    }
}


//------------------------------------------------------------------------------
@Component({
    selector      : 'invite',
    templateUrl: 'templates/account/invaite.html',
})
export class AdminAccountInvite {
    show = false;
    parrent = null;
    errors = [];
    obj_errors = {};
    first_nameErr = true;
    boolInvite = false;
    
    static get parameters() {
        return [[Http], [FormBuilder], [AdminUtils], [Admin]];
    }
    constructor(http, formbuilder, utils, admin) {
        this._http = http;
        this._utils = utils;
        this._admin = admin;
        this.lform = formbuilder.group({
                    'email':    ['', this._utils.emailValidator],
                    'first_name': ['', Validators.required],
                    'last_name': ['', Validators.required],
                }); 
    }
    
    goInvite () {
        /*
        if(this.lform.controls['email'].status == 'INVALID' ||
            this.lform.controls['first_name'].status == 'INVALID' ||
            this.lform.controls['last_name'].status == 'INVALID') {
            //novalid
            return;
        }
        */
        this._http.post('/api/user-invite/', this.lform.value)
                .subscribe( data => { 
                                        this.show=false;
                                        this._admin.footer(`${this.lform.controls['first_name'].value} ${this.lform.controls['last_name'].value} has been invited`);
                                    },
                            err => { this.obj_errors = err.json(); this.errors = this._utils.to_array(err.json()); }, 
                            () => this.parrent.userRefresh() 
                 );                                
    }
    
    
    cls () {
        for (let control in this.lform.controls) {
            this.lform.controls[control].updateValue('', true, true);
        }
        this.obj_errors = {};
        this.errors = [];
    }
}


//------------------------------------------------------------------------------
@Component({
    selector      : 'main',
    templateUrl: 'templates/account/account.html',
})
export class AdminAccount {
    currentUser = null;
    users = [];    

//modal
    invite_user = null;
    delete_user = null;
    delete_sessions = null;
        
    static get parameters() {
        return [[Http], [AdminAuthService], [FormBuilder], [Router], 
        [DynamicComponentLoader], [ViewContainerRef], [Admin]];
    }
     
    constructor(http, authService, formbuilder, router, dcl, viewContainerRef, admin) {
        this._http = http;
        this._router = router;
        this.dcl = dcl;
        this.viewContainerRef = viewContainerRef;
        this._auth = authService;
        this._admin = admin;
    }

    ngOnInit() {
        this._admin.currentUrl();
        
        this._http.get('/api/admin/')
            .subscribe( data => this.users = data ); 
        
        this._auth.getCurrentUser().then(data => this.currentUser = data );
        
        this.dcl.loadNextToLocation(AdminAccountInvite,  this.viewContainerRef)
            .then((compRef)=> {
                this.invite_user = compRef.instance;
                this.invite_user.parrent = this; 
            });      
        
        this.dcl.loadNextToLocation(AdminAccountDelete,  this.viewContainerRef)
            .then((compRef)=> {
                this.delete_user = compRef.instance;
                this.delete_user.parrent = this; 
            });
        
        this.dcl.loadNextToLocation(AdminAccountDeleteSessions,  this.viewContainerRef)
            .then((compRef)=> {
                this.delete_sessions = compRef.instance;
                this.delete_sessions.parrent = this; 
            });    
    }
        
    setDate (date) {
        let d = new Date(date);
        return d;
    }
    
    goInvite() {
        this.invite_user.show = true;
        this.invite_user.cls();
    }
    
    goDelete(user) {
        this.delete_user.show = true;
        this.delete_user.user = user;
    }
    
    goDeleteSessions() {
        this.delete_sessions.show = true;
    }
    
    goProfile(user) {
        let link;
        if (user.token && this.currentUser.is_admin)
            link = ['/Accept', {'id': user.id, 'token': user.token }];
        else
            link = ['Profile', {'id': user.id }];
        this._router.navigate(link);
    }
    
    userRefresh() {
       this._http.get('/api/admin/')
            .subscribe( data => this.users = data );  
    }
}

//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminSettingsGeneral {
    component = 'General';
    static get parameters() {return [[Admin]];}
    constructor(admin) {
        this._admin = admin;
    }
    ngOnInit() {this._admin.currentUrl();}
}

//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminSettingsCheckout {
    component = 'Checkout';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}

// 
// @Component({
//   selector: 'main',
//   template : '<router-outlet></router-outlet>',
//   directives: [ROUTER_DIRECTIVES],
// })
// @RouteConfig([
// 
//     {
//         path : '/account/:id',
//         name : 'Profile',
//         component : AdminAccountProfile,
//     },
//     {
//         path : '/general',
//         name : 'General',
//         component : AdminSettingsGeneral,
//     },
//     {
//         path : '/account',
//         name : 'Account',
//         component : AdminAccount,
//     },
// ])
// export class AdminSettings {
// }

@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule,
        AdminComponentsModule
    ],
    providers: [
    ],
    declarations: [
        AdminAccountProfile,
        AdminSettingsCheckout,
        AdminSettingsGeneral
    ]
})
export class AdminSettingsModule {}
