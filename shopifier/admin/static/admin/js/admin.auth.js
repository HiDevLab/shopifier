import { Component, Injectable, Injector } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators } from 'angular2/common';
import { Router, RouteParams, CanActivate, ROUTER_DIRECTIVES } from 'angular2/router'
import { Http, Headers } from 'angular2/http'
import 'rxjs/Rx'

//------------------------------------------------------------------------------
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
                'Content-Type': 'application/json; charset=utf-8',
                'X-CSRFToken': this.getCookie('csrftoken')});
    }
    
    getCookie(name) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length == 2) 
            return parts.pop().split(";").shift();
    }
    
    post(user, url) {
        let body = JSON.stringify(user);
        return this.http.post(url, body,  {headers: this.headers})
                        .map(res => res.json());
    }
    
    get(url) {
        return this.http.get(url, {headers: this.headers})
                        .map(res => res.json());
    }
     
    delete(url) {
        return this.http.delete(url, {headers: this.headers});
    }
       
    emailValidator(control) {
        if (control.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            return null;
        }   else {
            return { 'detail': 'invalidEmailAddress' };
        }
    }

    to_array (data) {
        let err = data;
        let errors = [];
        if (Object.prototype.toString.call(err) === '[object Array]') 
            errors = err;
        else {    
            for (let i in err) {
                errors.push(i + ':' + err[i]);
            }
        }
        return errors;
    }
    
    get_currentUser() {
        this.currentUser = null;
        this.get('/api/current-user/')
            .subscribe( data => this.currentUser = data );                                
    }
}


//------------------------------------------------------------------------------
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


//------------------------------------------------------------------------------
@Component({
    selector      : 'section',
    template      : '',   
    directives    : [ROUTER_DIRECTIVES],
})
export class AdminAuthLogout {
   
    static get parameters() {
        return [[AdminAuthService], [Router]];
    }
    
    constructor(authService, router) {
        this._authService = authService;
        this._router = router;        
    }
   
    ngOnInit() {
        this._authService.get('/api/logout/')
                         .subscribe( data => this._router.navigate(['Login']) );                                
    }

}


//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(false, '/Admin/Home'))
@Component({
    selector      : 'section',
    templateUrl   : 'templates/admin-auth-login.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthLogin {
    message = '';
    errors = '';
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
            this.lform.controls['password'].updateValue('', true, true);
            this.lform.controls['email'].updateValue('', true, true);
        }
        else {
            this._authService.post(this.lform.value, '/api/login/')
                    .subscribe( data => { this._router.navigate(['/Admin/Home']);},
                                err => { 
                                            this.errors = err.json(); 
                                            this._authService.currentUser=null;
                                        } );                                
        }
    }
}


//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(false, '/Admin/Home'))
@Component({
    selector      : 'section',
    templateUrl   : 'templates/admin-auth-recover.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthRecover {
    message = '';
    errors = '';
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
            this.lform.controls['email'].updateValue('', true, true);            
        }
        else {
            this._authService.post(this.lform.value,'/api/recover/' )
                    .subscribe( data => { 
                                            this._authService.currentUser = data; 
                                            this._router.navigate(['Login']);
                                        },
                                err => {this.errors = err.json();});
        }
    }
}


//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(false, '/Admin/Home'))
@Component({
    selector      : 'section',
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
          this._authService.post(user, '/api/check_token2/')
                .subscribe( data => this._authService.currentUser = data,
                            err => {
                                        this._authService.currentUser=null; 
                                        this._router.navigate(['Recover']);
                                    });          
    }
    
    goReset() {
        if ( this.lform.controls['password1'].status == 'INVALID' 
            || this.lform.controls['password2'].status == 'INVALID' ) {
            
            this.errors = 'There was an error updating your password';
            this.lform.controls['password2'].updateValue('', true, true);
            this.lform.controls['password1'].updateValue('', true, true);            
        }
        
        else if (   this.lform.controls['password1'].value 
                    != this.lform.controls['password2'].value ) {
                    
            this.errors = 'There was an error updating your password';
            this.lform.controls['password2']._value ='';
            this.lform.controls['password1']._value ='';
        }
        
        else {         
            let user = {
                            'pk': this.pk, 
                            'token': this.token, 
                            'password': this.lform.controls['password1'].value 
                        };       
            
            this._authService.post(user, '/api/reset/')
                    .subscribe( data => { this._router.navigate(['/Admin/Home']);},
                                err => {
                                            this.errors = err.json(); 
                                            this._authService.currentUser=null;
                                        } );
        }
    }   
}
