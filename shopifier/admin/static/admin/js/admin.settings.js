import { Component, DynamicComponentLoader, ViewContainerRef } from 'angular2/core';
import { Router, RouteParams, RouteConfig, ROUTER_DIRECTIVES,  } from 'angular2/router'
import { FORM_PROVIDERS, FORM_DIRECTIVES, FormBuilder, Validators } from 'angular2/common';
import 'rxjs/Rx'

import { AdminAuthService } from './admin.auth'


//------------------------------------------------------------------------------
@Component({
    selector      : 'profile',
    templateUrl: 'templates/admin.account.profile.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAccountProfile{
    errors = [];
    obj_errors = {};
    user = null;
    
    static get parameters() {
        return [[AdminAuthService], [FormBuilder], [RouteParams]];
    }
    constructor(authService, formbuilder, routeparams ) {
        this._routeParams = routeparams;
        this._authService = authService;
    }
    
    ngOnInit() {
        let id = this._routeParams.get('id');
        console.log(id);
        this._authService.get(`/api/admin/${id}/`)
            .subscribe( data => console.log(this.user = data),
                        err => {this.obj_errors = err; this.errors = this._authService.to_array(err.json()); }, 
                       ); 
    }
}


//------------------------------------------------------------------------------
@Component({
    selector      : 'sessions',
    templateUrl: 'templates/admin.account.del-sessions.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAccountDeleteSessions {
    show = false;
    parrent = null;
    errors = [];
    obj_errors = {};
    
    static get parameters() {
        return [[AdminAuthService]];
    }
    constructor(authService) {
        this._authService = authService;
    }
    
    goDeleteSessions() {
        this._authService.delete('/api/sessions-expire/')
                .subscribe( () => {},
                            () => {}, 
                            () =>  {this.show=false;} 
                 );
    }   
}


//------------------------------------------------------------------------------
@Component({
    selector      : 'delete',
    templateUrl: 'templates/admin.account.delete.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAccountDelete {
    show = false;
    parrent = null;
    user = {};
    errors = [];
    obj_errors = {};
    
    static get parameters() {
        return [[AdminAuthService]];
    }
    constructor(authService) {
        this._authService = authService;
    }
    
    goDelete() {
        this._authService.delete(`/api/admin/${this.user.id}/`)
                .subscribe( () => { this.show=false;},
                            () => {}, 
                            () => this.parrent.userRefresh() 
                 );                                
    }   
}


//------------------------------------------------------------------------------
@Component({
    selector      : 'invite',
    templateUrl: 'templates/admin.account.invaite.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAccountInvite {
    show = false;
    parrent = null;
    errors = [];
    obj_errors = {};
    first_nameErr = true;
    boolInvite = false;
    
    static get parameters() {
        return [[AdminAuthService], [FormBuilder]];
    }
    constructor(authService, formbuilder) {
        
        this._authService = authService;
        this.lform = formbuilder.group({
                    'email':    ['', this._authService.emailValidator],
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
        this._authService.post(this.lform.value, '/api/user-invite/')
                .subscribe( data => { this.show=false;},
                            err => { this.obj_errors = err; this.to_array(err.json()); }, 
                            () => this.parrent.userRefresh() 
                 );                                
    }
    
    to_array (err) {
        if (Object.prototype.toString.call(err) === '[object Array]') 
            this.errors = err;
        else {    
            this.errors = [];
            for (let i in err) {
                this.errors.push(i + ':' + err[i]);
            }
        }
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
    templateUrl: 'templates/admin.account.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAccount {
    currentUser = null;
    users = [];    
    invite_user = null;
    delete_user = null;
    delete_sessions = null;
        
    static get parameters() {
        return [[AdminAuthService], [FormBuilder], [Router], [DynamicComponentLoader], [ViewContainerRef]];
    }
     
    constructor(authService, formbuilder, router, dcl, viewContainerRef) {
        this._router = router;
        this.dcl = dcl;
        this.viewContainerRef = viewContainerRef;
        this._authService = authService;
    }
    
    ngOnInit() {
        this._authService.get('/api/current-user/')
            .subscribe( data => this.currentUser = data );      

        this._authService.get('/api/admin/')
            .subscribe( data => this.users = data ); 
        
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
    
    userRefresh() {
       this._authService.get('/api/admin/')
            .subscribe( data => this.users = data );  
    }
}


//------------------------------------------------------------------------------ 
@Component({
  selector: 'section',
  template : '<router-outlet></router-outlet>',
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([

    {
        path : '/account/:id',
        name : 'Profile',
        component : AdminAccountProfile,
    },
    {
        path : '/account',
        name : 'Account',
        component : AdminAccount,
    },
])
export class AdminSettings {
}
