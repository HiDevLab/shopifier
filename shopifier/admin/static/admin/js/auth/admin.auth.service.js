'use strict';
(function(app) {
    app.AdminAuthService = ng.core.Class({
        constructor : [
            ng.http.Http,
            ng.router.Router,
            function(http, router) {
                this.http = http;
                this.router = router;
            }
        ],
        
        login(user) {
            let body = JSON.stringify(user);        
            return this.http.post(`/api/login/`, body, app.httpOptions )
                                .map(res => res.json());
        }, 
        
        user_logout() {
            return this.http.get(`/api/logout/` , app.httpOptions);
        },  
        
               
             
    });

/*    Utils   */    
    app.CheckCurrenUser = function(_found, _re_direct){
        let injector = ng.core.Injector.resolveAndCreate([Auth]);
        let auth = injector.get(Auth);
        return auth.check(_found, _re_direct);
    }
    
    class Auth {
        check(_found, _re_direct) {
            return new Promise((resolve, reject) => {
                app.Http.get(`/api/current-user/`, app.httpOptions).map(res => res.json())
                    .subscribe( data => {
                                app.currentUser = data;
                                let _u = Boolean(app.currentUser.id===0);
                                let _ret = _found ? !_u : _u;
                                
                                if(!_ret)
                                      app.Router.navigate([_re_direct]);             
                                resolve(_ret);
                            })
                
            })    
        }  
    }
    
    
    
})(window.app || (window.app = {}));
