/*
(function(app) {
    app.AdminAuthLogin = ng.core.Component({
        
        "selector"      : 'admin-auth-login-form',
        "templateUrl"   : "templates/admin-auth-login.html",
        "directives"    : [ng.common.FORM_DIRECTIVES],
        "providers"     : [app.AdminAuthService,],
        
    })
    .Class({
        constructor : [
            app.AdminAuthService,
                     
            function(adminauthService) {
                this._adminauthService = adminauthService;
                this.message = ``;
                this.errors = ``;
                this.user = app.User;
  
                this.lform = app.FormBuilder.group({
                    "email":    ['',this.emailValidator],
                    "password": ['', ng.common.Validators.required]
                }); 
            }
        ],
        
        goLogin() {
            if(this.lform.controls['email'].status == 'INVALID') {
                this.errors = this.lform.controls['email'].errors;
            }
            else {
                this._adminauthService.login(this.lform.value)login(user) {
            let body = JSON.stringify(user);        
            return this.http.post(`/api/login/`, body, app.httpOptions )
                                .map(res => res.json());
        }
                    .subscribe( data => app.currentUser = data,
                                err => this.errors = err.json(),
                                () => app.Router.navigate(['Admin'])
                    )
            }
        },
        
        emailValidator(control) {
            if (control.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
              return null;
            }   else {
                return { 'detail': 'invalidEmailAddress' };
            }
        },
        
        goLogout(){
            this._adminauthService.user_logout().subscribe();
           //  let link = ['Logout'];
          // this._router.navigate(link);
        } ,
           
    });
    
    ng.router.CanActivate(() => app.CheckCurrenUser(false, 'Admin'))(app.AdminAuthLogin); 
    
})(window.app || (window.app = {}));
*/
import { Component, Injectable } from 'angular2/core';

import { FORM_DIRECTIVES, FormBuilder, Validators, ngFormModel, ngFormControl, ngSubmit } from 'angular2/common';
import { Router } from 'angular2/router'
import { Http } from 'angular2/http'
import { AdminAuthService } from './admin.auth.service'

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
