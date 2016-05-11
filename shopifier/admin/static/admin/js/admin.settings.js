import { Component } from 'angular2/core';
import { Router, RouteConfig, ROUTER_DIRECTIVES,  } from 'angular2/router'
import { FORM_DIRECTIVES, FormBuilder, Validators } from 'angular2/common';

import { AdminAuthService } from './admin.auth'


//------------------------------------------------------------------------------
@Component({
    selector      : 'admin-account-form',
    templateUrl: 'templates/admin.account.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAccount {
    currentUser = null;
    users = [];    
    static get parameters() {
        return [[FormBuilder], [Router]];
    }
    
    constructor(formbuilder, router) {
        this._router = router;
        this._authService = window.injector.get(AdminAuthService);
        
        this._authService.get(`/api/current-user/`)
            .subscribe( data => this.currentUser = data );      
        this._authService.get(`/api/admin/`)
            .subscribe( data => this.users = data );      
                
    }
    
    setDate (date) {
        let d = new Date(date);
        return d;
    }
 
}


//------------------------------------------------------------------------------ 
@Component({
  selector: 'main',
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
