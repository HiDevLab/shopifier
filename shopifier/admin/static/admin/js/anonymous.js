'use strict';
(function(app) {
  app.Anonymous =
    ng.core.Component({
      "selector" : 'anonymous',
      "templateUrl" : "templates/anonymous.html",
      "directives" : [
          ng.router.ROUTER_DIRECTIVES, 
        ],
      "providers" : [ng.router.ROUTER_PROVIDERS, ng.http.HTTP_PROVIDERS, app.AnonymousService]
    })
    .Class({
        constructor : function() {
            this.title = "Shopifier";
            
        }
    });
    
  ng.router.RouteConfig([
    
    {
      path : '/auth/login',
      name : 'Login',
      component : app.AnonymousLogin,
      useAsDefault : true
    }, 
    
    {
      path : '/auth/logout',
      name : 'Logout',
      component : app.AnonymousLogin,
      useAsDefault : false
    }, 
    
    
  ])(app.Anonymous);
})(window.app || (window.app = {}));
