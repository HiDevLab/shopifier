import { Component, DynamicComponentLoader, ViewContainerRef } from 'angular2/core';
import { Router, RouteConfig, ROUTER_DIRECTIVES,  } from 'angular2/router'
import { FORM_DIRECTIVES, FormBuilder, Validators } from 'angular2/common';
import 'rxjs/Rx'

import { AdminAuthService } from './admin.auth'

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
    
    
    static get parameters() {
        return [[FormBuilder]];
    }
    constructor(formbuilder) {
        
        this._authService = window.injector.get(AdminAuthService);
        this.lform = formbuilder.group({
                    'email':    ['', this._authService.emailValidator],
                    'first_name': ['', Validators.required],
                    'last_name': ['', Validators.required],
                }); 
    }
    
    goInvite() {
        /*
        if(this.lform.controls['email'].status == 'INVALID' ||
            this.lform.controls['first_name'].status == 'INVALID' ||
            this.lform.controls['last_name'].status == 'INVALID') {
            //novalid
            return;
        }
        */
        this.obj_errors = {};
        this.errors = [];
        this._authService.post(this.lform.value, `/api/user-invite/`)
                .subscribe( data => { console.log(data); this.show=false;},
                            err => { this.to_array(err.json()); }, 
                            () => this.parrent.userRefresh() 
                 );                                
    
    }
    
    to_array (err) {
        this.obj_errors = err;
        
        if (Object.prototype.toString.call(err) === '[object Array]') 
            this.errors = err;
        else {    
            this.errors = [];
            for (let i in err) {
                this.errors.push(i + ':' + err[i]);
            }
        }
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
        
    static get parameters() {
        return [[FormBuilder], [Router], [DynamicComponentLoader], [ViewContainerRef]];
    }
     
    constructor(formbuilder, router, dcl, viewContainerRef) {
        this._router = router;
        this.dcl = dcl;
        this.viewContainerRef = viewContainerRef;
        
        this._authService = window.injector.get(AdminAuthService);
        
        this._authService.get(`/api/current-user/`)
            .subscribe( data => this.currentUser = data );      
        this._authService.get(`/api/admin/`)
            .subscribe( data => this.users = data ); 
        
        this.dcl.loadNextToLocation(AdminAccountInvite,  this.viewContainerRef)
            .then((compRef)=> {
                this.invite_user = compRef.instance;
                this.invite_user.parrent = this; 
            });      
    }
    
    setDate (date) {
        let d = new Date(date);
        return d;
    }
    
    goInvite() {
        this.invite_user.show = true;
        
        for (let control in this.invite_user.lform.controls) {
            this.invite_user.lform.controls[control].updateValue('', true, true);
        }
    }
    
    userRefresh() {
       this._authService.get(`/api/admin/`)
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
        path : '/account',
        name : 'Account',
        component : AdminAccount,
    }
])
export class AdminSettings {
}
