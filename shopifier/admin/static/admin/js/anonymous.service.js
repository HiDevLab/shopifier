(function(app) {
    app.AnonymousService = ng.core.Class({
        constructor : [
            ng.http.Http,
                function(http) {
                    this.http = http;
                }
        ],
  
        login(user) {
            let body = JSON.stringify(user);        
            return this.http.post(`account/login/`, body, {headers: {'Accept': 'application/json; charset=utf-8', 'Content-Type': 'application/json; charset=utf-8'}})
                                .map(res => res.json());
        }, 
        
        user_logout() {
            return this.http.get(`account/logout/`);
        },         
    });
})(window.app || (window.app = {}));
