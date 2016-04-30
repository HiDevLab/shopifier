'use strict';
(function(app) {
    app.AdminAuthService = ng.core.Class({
        constructor : [
            ng.http.Http,
            function(http) {
                this.http = http;
                
            }
        ],
        
        login(user) {
            let body = JSON.stringify(user);        
            return this.http.post(`/admin/auth/login/`, body, app.httpOptions )
                                .map(res => res.json());
        }, 
        
        user_logout() {
            return this.http.get(`/admin/auth/logout/` , app.httpOptions);
        },         
    });
})(window.app || (window.app = {}));
