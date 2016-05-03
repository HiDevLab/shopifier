System.config({
    transpiler: 'babel',
    babelOptions: {
         'optional': ['es7.decorators', 'es7.classProperties'],
    },
    map: {
        app: "/static/admin/js/",
        babel: 'https://cdn.jsdelivr.net/babel/5.8.38/browser.js',
    },
    packages: {
        app: {
            main: 'admin.boot',
            defaultExtension: 'js',
        },
    },
});
System.import('app').catch(console.error.bind(console));
