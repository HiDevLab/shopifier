System.config({
    transpiler: 'babel',
    babelOptions: {
         'optional': ['es7.decorators', 'es7.classProperties'],
    },
    map: {
        app: "/static/admin/js/",
        babel: 'https://cdn.jsdelivr.net/babel/5.8.38/browser.js',
        '@angular/http': '/static/@angular/http.umd.js',
        '@angular/core': '/static/@angular/core.umd.js',
        '@angular/platform-browser': '/static/@angular/platform-browser.umd.js',
        '@angular/common': '/static/@angular/common.umd.js',
        '@angular/compiler': '/static/@angular/compiler.umd.js',
        '@angular/forms': '/static/@angular/forms.umd.js',
        '@angular/platform-browser-dynamic': '/static/@angular/platform-browser-dynamic.umd.js',
        '@angular/router': '/static/@angular/router.umd.js',
        '@angular/router-deprecated': '/static/@angular/router-deprecated.umd.js',
        '@angular/upgrade': '/static/@angular/upgrade.umd.js',
    },
    packages: {
        app: {
            main: 'admin.boot',
            defaultExtension: 'js',
        },
    },
});
System.import('app').catch(console.error.bind(console));
