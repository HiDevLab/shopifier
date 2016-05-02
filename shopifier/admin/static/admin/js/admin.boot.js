'use strict';
(function(app) {
    document.addEventListener('DOMContentLoaded', function() {
        ng.platform.browser.bootstrap(app.AdminRouter, [ng.router.ROUTER_PROVIDERS, ng.http.HTTP_PROVIDERS, ng.common.FORM_PROVIDERS]);
    });
        
    //SET HTTP HEADERS
    app.httpHeaders = new ng.http.Headers(
                {'Accept': 'application/json; charset=utf-8', 
                'Content-Type': 'application/json; charset=utf-8'}
            );
    app.httpOptions = new ng.http.RequestOptions({ headers: app.httpHeaders });
    
    app.currentUser = { 'id':0 };


})(window.app || (window.app = {}));

