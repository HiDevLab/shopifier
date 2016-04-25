'use strict';
(function(app) {
  app.Account =
    ng.core.Component({
      "selector" : 'account',
      "templateUrl" : "admin/account.html",
      "styleUrls" : ["static/admin/css/account.css"],
      "directives" : [
          ng.router.ROUTER_DIRECTIVES,
        ],
      "providers" : [ng.router.ROUTER_PROVIDERS, ng.http.HTTP_PROVIDERS, app.AccountService]
    })
    .Class({
        constructor : function() {
            this.title = "Shopifier";
            this.user  = localStorage.getItem("user");
        }
    });
    
  ng.router.RouteConfig([
    {
      path : '/login',
      name : 'Login',
      component : app.AccountLogin,
      useAsDefault : false
    },
    {
      path : '/logout',
      name : 'Logout',
      component : app.AccountLogin,
      useAsDefault : false
    }
    
  ])(app.Account);
})(window.app || (window.app = {}));
 
