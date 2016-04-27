'use strict';
(function(app) {
   document.addEventListener('DOMContentLoaded', function() {
    ng.platform.browser.bootstrap(app.Anonymous);
  });
})(window.app || (window.app = {}));

