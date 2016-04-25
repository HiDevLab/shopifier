(function(app) {
    app.AccountService = ng.core.Class({
        
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
  
        logout() {
            return this.http.get(`account/logout/`,  {headers: {'Accept': 'application/json; charset=utf-8'}})
                                .map(res => res.json());        
        },
    });
})(window.app || (window.app = {}));
