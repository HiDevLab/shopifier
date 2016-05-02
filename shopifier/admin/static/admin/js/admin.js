/*
(function(app) {
    app.Admin = ng.core.Component({
        "selector" : 'admin-form',
        "templateUrl" : "templates/admin.html",
        "directives" : [
                        ng.common.FORM_DIRECTIVES,
                        ng.router.ROUTER_DIRECTIVES,
                        ],
        "providers" : [
                        ng.router.ROUTER_PROVIDERS, 
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
            }
       
        ],
    });
    
    ng.router.CanActivate(() => app.CheckCurrenUser(true, 'Login'))(app.Admin);  

})(window.app || (window.app = {}));
*/
import { Component } from 'angular2/core';

@Component({
  selector: 'admin-form',
  templateUrl: 'templates/admin.html',
})
export class Admin {
}
