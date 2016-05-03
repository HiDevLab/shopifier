import { Component, Injectable, Injector } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ngFormModel, ngFormControl, ngSubmit } from 'angular2/common';
import { Router } from 'angular2/router'
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
    
    login(user) {
        let body = JSON.stringify(user);
        return this._http.post(`/api/login/`, body,  {headers: this._headers}).map(res => res.json());
    }
    
    reset_password(user) {
        let body = JSON.stringify(user);
        return this._http.post(`/api/login/`, body,  {headers: this._headers}).map(res => res.json());
    }
}


@Injectable()    
class Auth {
    check(_found, _re_direct) {
        return new Promise((resolve, reject) => {resolve(false)});              
    }  
}

export function CheckCurrentUser(){
    let injector = Injector.resolveAndCreate([Auth]);
    let auth = injector.get(Auth);
    return auth.check();
}


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
                    "email":    ['',this.emailValidator],
                    "password": ['', Validators.required]
                }); 
        
    }
    
    goLogin() {
        if(this.lform.controls['email'].status == 'INVALID') {
            this.errors = this.lform.controls['email'].errors;
        }
        else {
            this._adminauthService.login(this.lform.value)
                    .subscribe( data => this.currentUser = data,
                                err => this.errors = err.json(),
                                () => this._router.navigate(['Admin'])
            )
        }
    }
        
    emailValidator(control) {
        if (control.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            return null;
        }   else {
            return { 'detail': 'invalidEmailAddress' };
        }
    }
}

