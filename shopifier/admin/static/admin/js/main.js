'use strict';
(function(app) {
   document.addEventListener('DOMContentLoaded', function() {
    ng.platform.browser.bootstrap(app.Account);
  });
})(window.app || (window.app = {}));

