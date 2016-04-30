(function(app) {
    app.AdminAuthLogin = ng.core.Component({
        
        "selector" : 'admin-auth-login-form',
        
        "templateUrl" : "templates/admin-auth-login.html",
        
        "directives" : [
                        ng.common.FORM_DIRECTIVES
                        ],
        "providers" : [
                        ng.common.FormBuilder, 
                        ng.common.Validators, 
                        app.AdminAuthService, 
                    ],
    })
    .Class({
        constructor : [
            app.AdminAuthService,
            ng.router.Router,
            ng.common.FormBuilder,
            
            function(adminauthService, router, formbilder) {
                this._adminauthService = adminauthService;
                this._router = router;
                this.message = ``;
                this.errors = ``;
                this.user = app.User;
  
                this.lform = formbilder.group({
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
                this._adminauthService.login(this.lform.value)
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
