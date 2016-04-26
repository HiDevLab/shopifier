(function(app) {
    app.AccountLogin = ng.core.Component({
        "selector" : 'login',
        "templateUrl" : "admin/account-login.html",
    })
    .Class({
        constructor : [
            app.AccountService,
            ng.router.RouteParams,
            function(accountService, routeParams) {
                this._accountService = accountService;
                this._routeParams = routeParams;
                this.message = ``
                this.user = app.User             
            }
        ],
        goLogin() {
           this._accountService.login(this.user).subscribe(data => console.log(this.message = data));
        },
        
        goLogout() {
           this._accountService.logout().subscribe(data => console.log(this.message = data));
        }
    });
})(window.app || (window.app = {}));
