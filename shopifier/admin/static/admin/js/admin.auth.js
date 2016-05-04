import { Component, Injectable, Injector } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators } from 'angular2/common';
import { Router, RouteParams, CanActivate } from 'angular2/router'
import { Http, Headers } from 'angular2/http'
import 'rxjs/Rx'

@Injectable()
export class AdminAuthService {
    
    currentUser = null;    
    message = '';
    errors = '';
    
    static get parameters() {
        return [[Http], [Router]];
    }
    
    constructor(http, router) {
        this.http = http;
        this.router = router;
        this.headers = new Headers({'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8'});
    }
    
    post(user, url) {
        let body = JSON.stringify(user);
        return this.http.post(url, body,  {headers: this.headers}).map(res => res.json());
    }
    
    get(url) {
        return this.http.get(url, {headers: this.headers}).map(res => res.json());
    }
       
    emailValidator(control) {
        if (control.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            return null;
        }   else {
            return { 'detail': 'invalidEmailAddress' };
        }
    }
}

export function getCurrentUser(_found, _re_direct) {
    let _authService = window.injector.get(AdminAuthService);
    let router = window.injector.get(Router);
    return new Promise((resolve, reject) => {
        _authService.get('/api/current-user/')
            .subscribe(function(data) {
                let _u = Boolean(data.id === 0);
                let _ret = _found ? !_u : _u;
                if(!_ret) { router.navigate([_re_direct]); }
                resolve(_ret);
            });
    });
}

@CanActivate(() => getCurrentUser(false, 'Admin'))
@Component({
    selector      : 'admin-auth-login-form',
    templateUrl   : 'templates/admin-auth-login.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthLogin {
    message = ``;
    errors = ``;
    currentUser = null;
    
    static get parameters() {
        return [[AdminAuthService], [FormBuilder], [Router]];
    }
    
    constructor(authService, formbuilder, router) {
        this._authService = authService;
        this._router = router;
        this.lform = formbuilder.group({
                    'email':    ['', this._authService.emailValidator],
                    'password': ['', Validators.required]
                }); 
        
    }
    
    goLogin() {
        if(this.lform.controls['email'].status == 'INVALID') {
            this.errors = this.lform.controls['email'].errors;
        }
        else {
            this._authService.post(this.lform.value, `/api/login/`)
                    .subscribe( data => { this._authService.currentUser = data; this._router.navigate(['Admin']);},
                                err => {this.errors = err.json(); this._authService.currentUser=null;} );                                
        }
    }
}

@CanActivate(() => getCurrentUser(false, 'Admin'))
@Component({
    selector      : 'admin-auth-recover-form',
    templateUrl   : 'templates/admin-auth-recover.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthRecover {
    message = ``;
    errors = ``;
    currentUser = ''
    
    static get parameters() {
        return [[AdminAuthService], [FormBuilder], [Router]];
    }
    
    constructor(authService, formbuilder, router) {
        this._authService = authService;
        this._router = router;
        this.lform = formbuilder.group({
                    'email':    ['', this._authService.emailValidator]
                }); 
        
    }
    
    goRecover() {
        if(this.lform.controls['email'].status == 'INVALID') {
            this.errors = this.lform.controls['email'].errors;
        }
        else {
            this._authService.post(this.lform.value,`/api/recover/` )
                    .subscribe( data => { this._authService.currentUser = data; this._router.navigate(['Login']);},
                                err => {this.errors = err.json();});
        }
    }
}


@CanActivate(() => getCurrentUser(false, 'Admin'))
@Component({
    selector      : 'admin-auth-reset-form',
    templateUrl   : 'templates/admin-auth-reset.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthReset {
    message = '';
    errors = '';
    email = '';
    pk = 0; 
    token = '';
    currentUser = ''
    
    static get parameters() {
        return [[AdminAuthService], [FormBuilder], [Router], [RouteParams]];
    }
    
    constructor(authService, formbuilder, router, routeparams) {
        this._authService = authService;
        this._router = router;
        this._routeParams = routeparams;
        this.lform = formbuilder.group({
                    'password1': ['',Validators.minLength(6)],
                    'password2': ['',Validators.minLength(6)]
                }); 
    }
    
    //The link to reset your password is no longer valid. to recover
    
    ngOnInit() {
          this.pk = this._routeParams.get('pk');
          this.token = this._routeParams.get('token');
          let user = {'pk': this.pk, 'token': this.token };
          this._authService.post(user, `/api/check_token2/`)
                .subscribe( data => this._authService.currentUser = data,
                            err => {this._authService.currentUser=null; this._router.navigate(['Recover']);});          
    }
    
    goReset() {
        if ( this.lform.controls['password1'].status == 'INVALID' || this.lform.controls['password2'].status == 'INVALID' ) {
            this.errors = 'There was an error updating your password';            
        }
        
        else if ( this.lform.controls['password1'].value != this.lform.controls['password2'].value ) {
            this.errors = 'There was an error updating your password';
        }
        
        else {         
            let user = {'pk': this.pk, 'token': this.token, 'password': this.lform.controls['password1'].value };       
            console.log(user);
            this._authService.post(user, `/api/reset/`)
                    .subscribe( data => { this._authService.currentUser = data; this._router.navigate(['Admin']);},
                                err => {this.errors = err.json(); this._authService.currentUser=null;} );
        }
    }   
}
