(function(app) {
    app.AnonymousLogin = ng.core.Component({
        "selector" : 'login-form',
        "templateUrl" : "templates/anonymous-login.html",
        "directives" : [
          ng.common.FORM_DIRECTIVES
        ],
        "providers" : [ng.common.FORM_PROVIDERS, ng.common.FormBuilder, ng.common.Validators,]
    })
    .Class({
        constructor : [
            app.AnonymousService,
            ng.router.Router,
            ng.common.FormBuilder,
            function(anonymousService, router, formbilder) {
                this._anonymousService = anonymousService;
                this._router = router;
                this.message = ``;
                this.errors = ``;
                this.user = app.User;
  
                this.lform = formbilder.group({
                    "email": ['',this.emailValidator],
                    "password": ['', ng.common.Validators.required]
                });
                
            }
        ],
        goLogin() {
            if(this.lform.controls['email'].status == 'INVALID') {
                this.errors = this.lform.controls['email'].errors;
            }
            else {
                this._anonymousService.login(this.lform.value)
                    .subscribe( data => this.message = data,
                                err => this.errors = err.json(),
                                () => alert(this.message.success)
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
            this._anonymousService.user_logout().subscribe();
            // let link = ['Logout'];
          // this._router.navigate(link);
        } ,   
    });
})(window.app || (window.app = {}));
