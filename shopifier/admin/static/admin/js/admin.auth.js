import 'rxjs/Rx';
import { CommonModule } from '@angular/common';
import { NgModule, Component, Directive, Injectable, Injector,
    ComponentFactoryResolver, ViewContainerRef, Compiler } from '@angular/core';
import { HttpModule, ConnectionBackend, Http, Headers, 
        Request, RequestOptions, RequestMethod } from '@angular/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
        Validators } from '@angular/forms';
import { RouterModule, Router, Routes, ActivatedRoute,  CanDeactivate, CanActivate } from '@angular/router';


// @Directive({ selector: 'modal-form'})
// export class ModalFormDirective {}

//------------------------------------------------------------------------------AdminUtils
@Injectable()
export class AdminUtils {
    static get parameters() {
        return [[Compiler]];
    }
    constructor(compiler) {
        this.compiler = compiler;
    }

    openDialog(parent, vcr, template) {
        let ret = new Promise((resolve, reject) => {
            @Component({ selector: 'dialog-comp', templateUrl: template})
            class DynamicHtmlComponent {
                fields = new Array(10);
                constructor() {
                    this.parent = parent;
                }
                resolve(result) {
                    component.destroy();
                    resolve(result);
                }

                reject(reason) {
                    component.destroy();
                    reject(reason);
                }
            };

            @NgModule({
                imports: [FormsModule, ReactiveFormsModule, CommonModule,],
                declarations: [DynamicHtmlComponent]
            })
            class DynamicHtmlModule {}

            let component = undefined;
            this.compiler.compileModuleAndAllComponentsAsync(DynamicHtmlModule)
                .then((factory) => {
                    let compFactory = factory.componentFactories.find(
                        x => x.componentType === DynamicHtmlComponent);
                    component = vcr.createComponent(compFactory, 0);
            });
        });
        return ret;
    }


    emailValidator(control) {
        if (control.value && control.value
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


//------------------------------------------------------------------------------AdminAuthService
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

    LogInOut(url, data) {
        this._currentUser = undefined;
        this._userPromise = undefined;
        return this._http.post(url, data).toPromise();
    }
    logOut() {
        return this.LogInOut('/api/logout/');
    }

    logIn(data) {
        return this.LogInOut('/api/login/', data);
    }

    emailValidator(control) {
        if (control.value
                    .match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            return null;
        }   
        else {
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


//------------------------------------------------------------------------------AdminAuthLogout
@Component({
    selector      : 'body',
    template      : '',
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
        this._auth.logOut().then(() => {
            this._router.navigate(['/auth/login']);
        });
    }
}


//------------------------------------------------------------------------------CanActivateAdmin
@Injectable()
export class CanActivateAdmin {
    static get parameters() {
        return [[AdminAuthService], [Router]];
    }

    constructor(authService, router) {
        this._auth = authService;
        this._router = router;
        this._re_direct = '/auth/login';
        this._found = true;
    }

    canActivate(component, route, state) {
        return this._auth.getCurrentUser()
        .then(() =>  {
            let _u = false;
            let _ret = this._found ? !_u : _u;
            if(!_ret) { this._router.navigate([this._re_direct]); }
            return _ret;
        },
        ()=>
        {
            let _u = true;
            let _ret = this._found ? !_u : _u;
            if(!_ret) { this._router.navigate([this._re_direct]); }
            return _ret;
        });
    }
}


//------------------------------------------------------------------------------CanDeactivateGuard
@Injectable()
export class CanDeactivateGuard {
     canDeactivate(component) {
        if (!component.formChange) {
            return true;
        }
        component.showLeavePageDialog = true;
        component.canDeactivate = new Promise(
            (resolve, reject) => {
                component.unloadPage = resolve;
            }
        );
        return component.canDeactivate;
    }
}


//------------------------------------------------------------------------------CanActivateLogin
@Injectable()
export class CanActivateLogin extends CanActivateAdmin {
    static get parameters() {
        return [[AdminAuthService], [Router]];
    }

    constructor(authService, router) {
        super(authService, router);
        this._re_direct = '/home';
        this._found = false;
    }
}


//------------------------------------------------------------------------------AdminAuthLogin
@Component({
    selector: 'body',
    templateUrl: 'templates/auth/login.html',
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
            this.lform.controls['password'].setValue('');
            this.lform.controls['email'].setValue('');
        }
        else {
            this._auth.logIn(this.lform.value).then(
                () => {
                    this._router.navigate(['../home'])
                },
                (err) => {
                    this.errors = err.json();
                    this.lform.controls['password'].setValue('');
                }
            );
        }
    }
}


//------------------------------------------------------------------------------AdminAuthRecover
@Component({
    selector: 'body',
    templateUrl: 'templates/auth/recover.html',
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
            this.lform.controls['email'].setValue('', true, true);
        }
        else {
            this._http.post('/api/recover/', this.lform.value )
                    .subscribe(() => this._router.navigate(['/auth/login']),
                               (err) => this.errors = err.json()
                    );
        }
    }
}


//------------------------------------------------------------------------------AdminAuthReset
@Component({
    selector: 'body',
    templateUrl: 'templates/auth/reset.html',
})
export class AdminAuthReset {
    message = '';
    errors = '';
    email = '';
    pk = 0; 
    token = '';

    static get parameters() {
        return [[Http], [AdminAuthService], [FormBuilder], [Router], [ActivatedRoute]];
    }

    constructor(http, authService, formbuilder, router, params) {
        this._http = http;
        this._auth = authService;
        this._router = router;
        this._params = params.snapshot.params;
        this.lform = formbuilder.group({
                    'password1': ['',Validators.minLength(6)],
                    'password2': ['',Validators.minLength(6)]
        }); 
    }

    //The link to reset your password is no longer valid. to recover
    ngOnInit() {
        this.pk = this._params.pk;
        this.token = this._params.token;
        let user = {'pk': this.pk, 'token': this.token };
        this._http.post('/api/check_token2/', user)
                .subscribe((data) => this.currentUser = data,
                           (err) => this._router.navigate(['auth/recover'])
                );
    }

    goReset() {
        if ( this.lform.controls['password1'].status == 'INVALID' 
            || this.lform.controls['password2'].status == 'INVALID' ) {

            this.errors = 'There was an error updating your password';
            this.lform.controls['password2'].setValue('');
            this.lform.controls['password1'].setValue('');
        }

        else if (   this.lform.controls['password1'].value 
                    != this.lform.controls['password2'].value ) {

            this.errors = 'There was an error updating your password';
            this.lform.controls['password2'].setValue('');
            this.lform.controls['password1'].setValue('');
        }

        else {
            let user = {
                        'pk': this.pk, 
                        'token': this.token, 
                        'password': this.lform.controls['password1'].value
                    };

            this._http.post('/api/reset/', user)
                    .subscribe(() => this._router.navigate(['/home']),
                               (err) => this.errors = err.json()
                    );
        }
    }
}


//------------------------------------------------------------------------------AdminAuthAccept
@Component({
    selector      : 'body',
    templateUrl   : 'templates/auth/accept.html',
})
export class AdminAuthAccept {
    errors = [];
    obj_errors = {};
    user = undefined;
    declineInvitation = undefined;

    static get parameters() {
        return [[Http], [AdminAuthService], [FormBuilder], [Router], [ActivatedRoute]];
    }

    constructor(http, authService, formbuilder, router, params) {
        this._http = http;
        this._auth = authService;
        this._router = router;
        this._params = params.snapshot.params;

        this.lform = formbuilder.group({
            'first_name': ['', Validators.required],
            'last_name': ['', Validators.required],
            'phone': '',
            'email': '',
            'password1': '',
            'password2': '',
            'token': '',
            'id': '',
        }); 
    }

    ngOnInit() {
        this.token = this._params.token;
        let data = {'pk': this._params.id, 'token': this.token };
        this._http.post('/api/check_token1/', data)
            .subscribe(
                (data) => this.onInit(data),
                (err) => this._router.navigate(['/auth/wrong_token'])
        );
    }

    onInit(data) {
        this.user = data;
        this.errors = [];
        this.obj_errors = {};

        for (let control in this.lform.controls) {
            this.lform.controls[control].setValue(undefined);
            this.lform.controls[control]
                .setValue(this.user[control]);
        }
        this.lform.controls['token'].setValue(this.token);
        this.lform.controls['password1'].setValue('');
    }

    createAccount(){
        this._http
            .post('/api/user-activate/', this.lform.value )
            .subscribe(() => this._router.navigate(['/home']),
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
            .subscribe( () => this._router.navigate(['/auth/login']),
                        () => this._router.navigate(['/auth/login']), 
            );
    }
}


//------------------------------------------------------------------------------AdminAuthWrongToken
@Component({
    selector      : 'body',
    templateUrl   : 'templates/auth/wrong-token.html',
})
export class AdminAuthWrongToken {
}


//------------------------------------------------------------------------------SuperHttp
@Injectable()
export class SuperHttp extends Http {
  
    static get parameters() {
        return [[ConnectionBackend], [RequestOptions]];
    }
    constructor(backend, defaultOptions) {
        super(backend, defaultOptions);
        this.requestoptions = new RequestOptions({});
        this.requestoptions.headers = new Headers({
                    'Accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-CSRFToken': ''
                });
    }

    csrfToken() {
        let value = '; ' + document.cookie;
        let parts = value.split('; csrftoken=');
        if (parts.length == 2){ 
            this.requestoptions
                .headers.set('X-CSRFToken', parts.pop().split(";").shift());
        }
    }

    request(method, url, data){
        this.csrfToken();
        this.requestoptions.method = RequestMethod[method];
        this.requestoptions.url= url;
        this.requestoptions.body = (data) ? JSON.stringify(data) : undefined;
        let request = new Request(this.requestoptions);
        return super.request(request).map(res => res.json());
    }

    post(url, data) {
        return this.request('Post', url, data);
    }

    put(url, data) {
        return this.request('Put', url, data);
    }

    patch(url, data) {
        return this.request('Patch', url, data);
    }

    get(url) {
        return this.request('Get', url);
    }

    options(url) {
        return this.request('Options', url);
    }

    delete(url) {
        return this.request('Delete', url);
//         this.csrfToken();
//         return super.delete(url, {headers: this.requestoptions.headers});
    }
    template(url) {
        this.csrfToken();
        this.requestoptions.method = RequestMethod['Get'];
        this.requestoptions.url= url;
        this.requestoptions.body = undefined;
        let request = new Request(this.requestoptions);
        return super.request(request);
    }
}


//------------------------------------------------------------------------------AdminAuthModule
const routes = [
    {path: 'auth', children: [
        { path : 'login', component : AdminAuthLogin, canActivate: [CanActivateLogin] },
        { path : 'logout', component : AdminAuthLogout },
        { path : 'recover', component : AdminAuthRecover, canActivate: [CanActivateLogin] },
        { path : 'reset/:pk/:token', component : AdminAuthReset, canActivate: [CanActivateLogin] },
        { path : 'accept/:id/:token', component : AdminAuthAccept, },
        { path : 'wrong_token', component : AdminAuthWrongToken }
    ]}
]
export const authRouting = RouterModule.forChild(routes);


@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule, HttpModule,
        authRouting
    ],
    providers: [
        AdminAuthService,
        AdminUtils,
        CanActivateLogin,
        CanActivateAdmin,
        CanDeactivateGuard,
        SuperHttp
    ],
    declarations: [
//         ModalFormDirective,
        AdminAuthLogin,
        AdminAuthLogout,
        AdminAuthRecover,
        AdminAuthReset,
        AdminAuthAccept,
        AdminAuthWrongToken, 
    ]
})
export class AdminAuthModule {}
