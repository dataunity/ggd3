;(function (global, factory) {
    'use strict';
    
    var hasDefine = typeof define === 'function' && define.amd,
        hasExports = typeof module !== 'undefined' && module.exports;

        if ( hasDefine ){ 
            // AMD Module
            define(['jquery', 'du-stomp'], factory);
        } else if ( hasExports ) { 
            // Node.js Module
            module.exports = factory(require(['jquery', 'du-stomp']));
        } else { 
            // Assign to common namespaces or simply the global object (window)
            global.duDashboards = factory(jQuery, Stomp);
        }
})(typeof window !== "undefined" ? window : this, function ($, Stomp) {
    'use strict';
    console.log("TODO: PUT IN REAL GGJS");
    var ggjs = null;
    var dashboard = {};


    return dashboard;
});