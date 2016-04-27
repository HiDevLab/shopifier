(function(app) {
    app.AnonymousLogin = ng.core.Component({
        "selector" : 'login',
        "templateUrl" : "admin/anonymous-login.html",
    })
    .Class({
        constructor : [
            app.AnonymousService,
            ng.router.RouteParams,
            function(anonymousService, routeParams) {
                this._anonymousService = anonymousService;
                this._routeParams = routeParams;
                this.message = ``
                this.user = app.User             
            }
        ],
        goLogin() {
           this._anonymousService.login(this.user).subscribe(data => console.log(this.message = data));
        }
    });
})(window.app || (window.app = {}));
