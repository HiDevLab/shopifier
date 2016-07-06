import { Component, Injectable, Injector } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators } from 'angular2/common';
import { Router, RouteParams, CanActivate,
         ROUTER_DIRECTIVES } from 'angular2/router';
import { Http } from 'angular2/http';
import 'rxjs/Rx';


//------------------------------------------------------------------------------
@Injectable()
export class AdminUtils {

    emailValidator(control) {
        if (control.value
            .match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
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
}


//------------------------------------------------------------------------------
@Injectable()
export class AdminAuthService {

    message = '';
    errors = '';

    static get parameters() {
        return [[Http]];
    }

    constructor(http, router) {
        this._http = http;
    }

    getCurrentUser() {
        if (this._currentUser) {
            return new Promise((resolve, reject) => resolve(this._currentUser));
        }

        this._userPromise = this._userPromise || 
                            this._http.get('/api/current-user/')
            .toPromise()
            .then(data => this._currentUser = data);
        return this._userPromise;
    }

    refreshCurrentUser() {
        this._userPromise = this._http.get('/api/current-user/')
            .toPromise()
            .then(data => this._currentUser = data);
        return this._userPromise;
    }

    logOut() {
        return this._http
                .get('/api/logout/')
                .toPromise()
                .then(() => { 
                                this._currentUser = undefined;
                                this._userPromise = undefined;
                        }, 
                        () => { 
                                this._currentUser = undefined;
                                this._userPromise = undefined;
                        },);
    }

    logIn(data) {
        return this._http
                .post('/api/login/', data)
                .toPromise()
                .then(() => {
                                this._currentUser = undefined;
                                this._userPromise = undefined;
                        }, 
                        () => { 
                                this._currentUser = undefined;
                                this._userPromise = undefined;
                        });
    }

    emailValidator(control) {
        if (control.value
                    .match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            return null;
        }   else {
            return {'detail': 'invalidEmailAddress'};
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
}


export function getCurrentUser(_found, _re_direct) {
    let _auth = window.injector.get(AdminAuthService);
    let router = window.injector.get(Router);
    return _auth.getCurrentUser()
        .then(() => 
        {
            let _u = false;
            let _ret = _found ? !_u : _u;
            if(!_ret) { router.navigate([_re_direct]); }
            return _ret;
        },
        ()=>
        {
            let _u = true;
            let _ret = _found ? !_u : _u;
            if(!_ret) { router.navigate([_re_direct]); }
            return _ret;
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
        this._auth = authService;
        this._router = router;
    }

    ngOnInit() {
        this._auth.logOut()
            .then( () => this._router.navigate(['/Login']))
    }

}


//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(false, '/Admin/Home'))
@Component({
    selector      : 'section',
    templateUrl   : 'templates/auth/login.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthLogin {
    message = '';
    errors = '';

    static get parameters() {
        return [[AdminAuthService], [FormBuilder], [Router]];
    }

    constructor(authService, formbuilder, router) {
        this._auth = authService;
        this._router = router;
        this.lform = formbuilder.group({
                    'email':    ['', this._auth.emailValidator],
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
            this._auth
                .logIn(this.lform.value)
                .then(() => this._router.navigate(['/Admin/Home']),
                      (err) => this.errors = err.json()
                );
        }
    }
}


//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(false, '/Admin/Home'))
@Component({
    selector      : 'section',
    templateUrl   : 'templates/auth/recover.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthRecover {
    message = '';
    errors = '';
    currentUser = ''

    static get parameters() {
        return [[Http], [AdminAuthService], [FormBuilder], [Router]];
    }

    constructor(http, authService, formbuilder, router) {
        this._http = http;
        this._auth = authService;
        this._router = router;
        this.lform = formbuilder.group({
                        'email': ['', this._auth.emailValidator]
                    }); 
    }

    goRecover() {
        if(this.lform.controls['email'].status == 'INVALID') {
            this.errors = this.lform.controls['email'].errors;
            this.lform.controls['email'].updateValue('', true, true);
        }
        else {
            this._http.post('/api/recover/', this.lform.value )
                    .subscribe(() => this._router.navigate(['Login']),
                               (err) => this.errors = err.json()
                    );
        }
    }
}


//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(false, '/Admin/Home'))
@Component({
    selector      : 'section',
    templateUrl   : 'templates/auth/reset.html',
    directives    : [FORM_DIRECTIVES],
})
export class AdminAuthReset {
    message = '';
    errors = '';
    email = '';
    pk = 0; 
    token = '';

    static get parameters() {
        return [[Http], [AdminAuthService],
                [FormBuilder], [Router], [RouteParams]];
    }

    constructor(http, authService, formbuilder, router, routeparams) {
        this._http = http;
        this._auth = authService;
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
          this._http.post('/api/check_token2/', user)
                .subscribe((data) => this.currentUser = data,
                           (err) => this._router.navigate(['Recover'])
                );
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

            this._http.post('/api/reset/', user)
                    .subscribe(() => this._router.navigate(['/Admin/Home']),
                               (err) => this.errors = err.json()
                    );
        }
    }
}


//------------------------------------------------------------------------------
//@CanActivate(() => getCurrentUser(false, '/Admin/Home'))
@Component({
    selector      : 'section',
    templateUrl   : 'templates/auth/accept.html',
    directives    : [FORM_DIRECTIVES, ROUTER_DIRECTIVES],
})
export class AdminAuthAccept {
    errors = [];
    obj_errors = {};

    user = undefined;

    declineInvitation = undefined;

    static get parameters() {
        return [[Http], [AdminAuthService],
                [FormBuilder], [Router], [RouteParams]];
    }

    constructor(http, authService, formbuilder, router, routeparams) {
        this._http = http;
        this._auth = authService;
        this._router = router;
        this._routeParams = routeparams;

        this.lform = formbuilder.group({
            'first_name': ['', Validators.required],
            'last_name': ['', Validators.required],
            'phone': [''],
            'email': [''],
            'password1': [''],
            'password2': [''],
            'token': [''],
            'id': [''],
        }); 
    }

    ngOnInit() {
        let id = this._routeParams.get('id');
        this.token = this._routeParams.get('token');
        let data = {'pk': id, 'token': this.token };
        this._http.post('/api/check_token1/', data)
                .subscribe((data) => this.onInit(data),
                            (err) => this._router.navigate(['WrongToken'])
                );
    }

    onInit(data) {
        this.user = data;
        this.errors = [];
        this.obj_errors = {};

        for (let control in this.lform.controls) {
            this.lform.controls[control].updateValue(undefined);
            this.lform.controls[control]
                .updateValue(this.user[control],true, true);
        }
        this.lform.controls['token'].updateValue(this.token);
        this.lform.controls['password1'].updateValue('');
    }

    createAccount(){
        this._http
            .post('/api/user-activate/', this.lform.value )
            .subscribe(() => this._router.navigate(['/Admin/Home']),
                       (err) => { 
                                this.obj_errors = err.json(); 
                                this.errors = this._auth.to_array(err.json());
                        }, 
            );
    }

    declineInvitationt() {
        let data = {'pk': this.user.id, 'token': this.token};
        this._http
            .post('/api/user-decline/', data )
            .subscribe( () => this._router.navigate(['Login']),
                        () => this._router.navigate(['Login']), 
            );
    }
}


//------------------------------------------------------------------------------
@Component({
    selector      : 'section',
    templateUrl   : 'templates/auth/wrong-token.html',
    directives: [ROUTER_DIRECTIVES],
})
export class AdminAuthWrongToken {
}
