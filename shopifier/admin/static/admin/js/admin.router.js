'use strict';
(function(app) {
  app.AdminRouter =
    ng.core.Component({
      "selector"    : "admin",
      "template"    : "<router-outlet></router-outlet>",
      "directives"  : [ng.router.ROUTER_DIRECTIVES,],
     })
    .Class({
        constructor : [
            ng.http.Http,
            ng.router.Router,
            ng.common.FormBuilder,
            function(http, router, formbuilder) {
                app.Http = http;
                app.Router = router;
                app.FormBuilder = formbuilder;                
            }
        ],
    });
    
// @RouteConfig begin  
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
 // @RouteConfig end 
  
})(window.app || (window.app = {}));
