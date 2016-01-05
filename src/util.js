ggjs.util = (function () {
    var isUndefined = function (val) {
            return typeof val === 'undefined';
        },
        isNullOrUndefined = function (val) {
            return isUndefined(val) || val === null;
        },
        isFunction = function(obj) {
            return typeof obj === "function";
        },
        isArray = Array.isArray,
        isPlainObject = function( obj ) {
            // Note: Copied from jQuery source (slightly modified to reduce dependencies)
            var hasOwn = {}.hasOwnProperty;

            // Not plain objects:
            // - Any object or value whose internal [[Class]] property is not "[object Object]"
            // - DOM nodes
            // - window
            if ( typeof obj !== "object" || obj.nodeType ) { // || jQuery.isWindow( obj ) ) {
                return false;
            }

            if ( obj.constructor &&
                    !hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
                return false;
            }

            // If the function hasn't returned already, we're confident that
            // |obj| is a plain object, created by {} or constructed with new Object
            return true;
        },
        objKeys = function (obj) {
            var keys = [],
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) keys.push(key);
            }
            return keys;
        },
        countObjKeys = function (obj) {
            return objKeys(obj).length;
        },
        extend = function() {
            // Note: Copied from jQuery source
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[ 0 ] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if ( typeof target === "boolean" ) {
                deep = target;

                // Skip the boolean and the target
                target = arguments[ i ] || {};
                i++;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if ( typeof target !== "object" && !isFunction( target ) ) {
                target = {};
            }

            // Extend jQuery itself if only one argument is passed
            if ( i === length ) {
                target = this;
                i--;
            }

            for ( ; i < length; i++ ) {

                // Only deal with non-null/undefined values
                if ( ( options = arguments[ i ] ) !== null ) {

                    // Extend the base object
                    for ( name in options ) {
                        src = target[ name ];
                        copy = options[ name ];

                        // Prevent never-ending loop
                        if ( target === copy ) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if ( deep && copy && ( isPlainObject( copy ) ||
                            ( copyIsArray = isArray( copy ) ) ) ) {

                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && isArray( src ) ? src : [];

                            } else {
                                clone = src && isPlainObject( src ) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[ name ] = extend( deep, clone, copy );

                        // Don't bring in undefined values
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        },
        deepCopy = function (obj) {
            if (isArray(obj)) {
                return extend(true, [], obj);
            } else {
                return extend(true, {}, obj);
            }
            //return extend(true, {}, obj);
            // return JSON.parse(JSON.stringify(obj));
        },
        toBoolean = function(obj){
            var str;
            if (obj === null || isUndefined(obj)) {
                return false;
            }
            str = String(obj).trim().toLowerCase();
            switch(str){
                case "true": 
                case "yes": 
                case "1": 
                    return true;
                case "false": 
                case "no": 
                case "0": 
                    return false;
                default:
                    return Boolean(str);
            }
        };

    return {
        isUndefined: isUndefined,
        isNullOrUndefined: isNullOrUndefined,
        isArray: isArray,
        objKeys: objKeys,
        countObjKeys: countObjKeys,
        deepCopy: deepCopy,
        toBoolean: toBoolean,
        isPlainObject: isPlainObject,
        extend: extend
    };
})();

ggjs.util.array = (function () {
    var indexOf = function(arr, item) {
            // Finds the index of item in array
            var index = -1,
                i;
            for(i = 0; i < arr.length; i++) {
                if(arr[i] === item) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        contains = function (arr, item) {
            return indexOf(arr, item) !== -1;
        };
    return {
        indexOf: indexOf,
        contains: contains
    };
})();
