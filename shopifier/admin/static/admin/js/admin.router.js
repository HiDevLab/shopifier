'use strict';
(function(app) {
  app.AdminRouter =
    ng.core.Component({
      "selector" : "admin-router",
      "templateUrl" : "templates/admin-router.html",
      "directives" : [
                        ng.router.ROUTER_DIRECTIVES, 
                    ],
      "providers" : [
                        ng.router.ROUTER_PROVIDERS, 
                        ng.router.ROUTER_DIRECTIVES,
                        ng.http.HTTP_PROVIDERS, 
                        ng.common.FORM_PROVIDERS, 
                    ]
    })
    .Class({
        constructor : [
            ng.http.Http,
            ng.router.Router,
            function(http, router) {
                app.Http = http;
                app.Router = router;
            }
        ],
    });
    
    
    
    ng.router.RouteConfig([ 
    
    {
      path : '/',
      name : 'Admin',
      component : app.Admin,
      useAsDefault : true,
      
    },
    
    {
      path : '/auth/login',
      name : 'Login',
      component : app.AdminAuthLogin,
      useAsDefault : false
    }, 
    
    {
      path : '/auth/logout',
      name : 'Logout',
      component : app.AdminAuthLogin,
      useAsDefault : false
    }, 
    
  ])(app.AdminRouter);
  
})(window.app || (window.app = {}));
