;(function (global, factory) {
    'use strict';
    
    var hasDefine = typeof define === 'function' && define.amd,
        hasExports = typeof module !== 'undefined' && module.exports;

        if ( hasDefine ){ 
            // AMD Module
            define(['d3', 'L'], factory);
        } else if ( hasExports ) { 
            // Node.js Module
            module.exports = factory(require(['d3', 'L']));
        } else { 
            // Assign to common namespaces or simply the global object (window)
            global.ggjs = factory(d3, L);
        }
})(typeof window !== "undefined" ? window : this, function (d3, L) {
    // 'use strict';
    console.log("Put strict mode back in");
    var ggjs = {};
