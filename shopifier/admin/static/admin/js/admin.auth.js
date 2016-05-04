import { Component, Injectable, Injector } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ngFormModel, ngFormControl, ngSubmit } from 'angular2/common';
import { Router, RouteParams, CanActivate } from 'angular2/router'
import { Http, Headers } from 'angular2/http'
import 'rxjs/Rx'

@Injectable()
export class AdminAuthService {
    
    static get parameters() {
        return [[Http], [Router]];
    }
    
    constructor(http, router) {
        this._http = http;
        this._router = router;
        this._headers = new Headers({'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8'});
    }
    
    post(user, url) {
        let body = JSON.stringify(user);
        return this._http.post(url, body,  {headers: this._headers}).map(res => res.json());
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
    let http = window.injector.get(Http);
    let router = window.injector.get(Router);
    let headers = new Headers({
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
    });
   
    return new Promise((resolve, reject) => {
        http.get('/api/current-user/', {headers: headers})
            .map(res => res.json())
            .subscribe(function(data) {
                let _u = Boolean(data.id === 0);
                let _ret = _found ? !_u : _u;
                
                if(!_ret) {
                    router.navigate([_re_direct]);
                }
                resolve(_ret);
            });
    });
}

@CanActivate(() => getCurrentUser(false, 'Admin'))
@Component({
    selector      : 'admin-auth-login-form',
    templateUrl   : 'templates/admin-auth-login.html',
    directives    : [FORM_DIRECTIVES],
    providers     : [AdminAuthService]
})
export class AdminAuthLogin {
    message = ``;
    errors = ``;
    currentUser = ''
    
    static get parameters() {
        return [[AdminAuthService], [Router], [FormBuilder]];
    }
    
    constructor(adminauthService, router, formbuilder) {
        this._adminauthService = adminauthService;
        this._router  = router;
        this.lform = formbuilder.group({
                    'email':    ['', this._adminauthService.emailValidator],
                    'password': ['', Validators.required]
                }); 
        
    }
    
    goLogin() {
        if(this.lform.controls['email'].status == 'INVALID') {
            this.errors = this.lform.controls['email'].errors;
        }
        else {
            this._adminauthService.post(this.lform.value, `/api/login/`)
                    .subscribe( data => this.currentUser = data,
                                err => this.errors = err.json(),
                                () => this._router.navigate(['Admin'])
            )
        }
    }
 
}

@CanActivate(() => getCurrentUser(false, 'Admin'))
@Component({
    selector      : 'admin-auth-recover-form',
    templateUrl   : 'templates/admin-auth-recover.html',
    directives    : [FORM_DIRECTIVES],
    providers     : [AdminAuthService]
})
export class AdminAuthRecover {
    message = ``;
    errors = ``;
    currentUser = ''
    
    static get parameters() {
        return [[AdminAuthService], [Router], [FormBuilder]];
    }
    
    constructor(adminauthService, router, formbuilder) {
        this._adminauthService = adminauthService;
        this._router  = router;
        this.lform = formbuilder.group({
                    'email':    ['', this._adminauthService.emailValidator]
                }); 
        
    }
    
    goRecover() {
        if(this.lform.controls['email'].status == 'INVALID') {
            this.errors = this.lform.controls['email'].errors;
        }
        else {
            this._adminauthService.post(this.lform.value,`/api/recover/` )
                    .subscribe( data => this.currentUser = data,
                                err => this.errors = err.json(),
                                () => this._router.navigate(['Login'])//Instructions to reset your password have been emailed to you
            )
        }
    }
}


@CanActivate(() => getCurrentUser(false, 'Admin'))
@Component({
    selector      : 'admin-auth-reset-form',
    templateUrl   : 'templates/admin-auth-reset.html',
    directives    : [FORM_DIRECTIVES],
    providers     : [AdminAuthService]
})
export class AdminAuthReset {
    message = '';
    errors = '';
    email = '';
    pk = 0; 
    token = '';
    currentUser = ''
    
    static get parameters() {
        return [[AdminAuthService], [Router], [FormBuilder], [RouteParams]];
    }
    
    constructor(adminauthService, router, formbuilder, routeparams) {
        this._adminauthService = adminauthService;
        this._router  = router;
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
          this._adminauthService.post(user, `/api/check_token2/`)
                .subscribe( data => this.currentUser = data,
                            err => this._router.navigate(['Recover']));          
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
            this._adminauthService.post(user, `/api/reset/`)
                    .subscribe( data => this.currentUser = data,
                                err => this.errors = err.json(),
                                () => this._router.navigate(['Admin']));
        }
    }   
}
