'use strict';
(function(app) {
  app.Anonymous =
    ng.core.Component({
      "selector" : 'anonymous',
      "templateUrl" : "admin/anonymous.html",
      "directives" : [
          ng.router.ROUTER_DIRECTIVES, 
        ],
      "providers" : [ng.router.ROUTER_PROVIDERS, ng.http.HTTP_PROVIDERS, app.AnonymousService]
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
      component : app.AnonymousLogin,
      useAsDefault : true
    }, 
    
    {
      path : '/logout',
      name : 'Logout',
      component : app.AnonymousLogin,
      useAsDefault : false
    }, 
    
    
    
  ])(app.Anonymous);
})(window.app || (window.app = {}));
 
