'use strict';
(function(app) {
  app.AdminRouter =
    ng.core.Component({
      "selector" : "admin",
      "templateUrl" : "templates/admin-router.html",
      "directives" : [
                        ng.router.ROUTER_DIRECTIVES, 
                    ],
      "providers" : [
                        ng.router.ROUTER_PROVIDERS, 
                        ng.http.HTTP_PROVIDERS, 
                        ng.common.FORM_PROVIDERS, 
                    ]
    })
    .Class({
        constructor : [
            ng.http.Http,
            function(http) {
                this.http = http;
                this.title = "Shopifier";
            }
        ],
        ngOnInit() {
            this.http.get(`/api/current-user/`, app.httpOptions)
                .map(res => res.json())
                .subscribe(data => app.currentUuser = data);
        },
    });
    
    
    ng.router.RouteConfig([ 
    {
      path : '/auth/login',
      name : 'Login',
      component : app.AdminAuthLogin,
      useAsDefault : true
    }, 
    
    {
      path : '/auth/logout',
      name : 'Logout',
      component : app.AdminAuthLogin,
      useAsDefault : false
    }, 
    
    
  ])(app.AdminRouter);
})(window.app || (window.app = {}));
