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

ggjs.Dataset = (function() {
    var dataset = function(spec) {
        spec = spec || {};
        if (ggjs.util.isUndefined(spec.name)) throw new Error("The dataset name must be defined");
        this.dataset = {
            name: spec.name,
            values: spec.values || null,
            url: spec.url || null,
            contentType: spec.contentType || null,
            dataTypes: spec.dataTypes || {}
        };
        //if (s) ggjs.extend(this.dataset, s);
    };

    var prototype = dataset.prototype;

    prototype.name = function (val) {
        if (!arguments.length) return this.dataset.name;
        this.dataset.name = val;
        return this;
    };

    prototype.values = function(val) {
        // Note: values should be JSON style data, e.g:
        // [{"a": 1, "b": 1}, {"a": 2, "b": 2}]
        if (!arguments.length) return this.dataset.values;
        this.dataset.values = val;
        return this;
    };

    prototype.url = function (val) {
        if (!arguments.length) return this.dataset.url;
        this.dataset.url = val;
        return this;
    };

    prototype.contentType = function (val) {
        if (!arguments.length) return this.dataset.contentType;
        this.dataset.contentType = val;
        return this;
    };

    prototype.dataTypes = function (val) {
        if (!arguments.length) return this.dataset.dataTypes;
        this.dataset.dataTypes = val;
        return this;
    };

    prototype.applyDataTypesToValues = function (dataTypes, values) {
        // Applies the user supplied data types
        // to values in dataset
        var isUndefined = ggjs.util.isUndefined,
            toBoolean = ggjs.util.toBoolean,
            fieldName, dataType, i, val;

        if (!values) {
            return;
        }

        for (fieldName in dataTypes) {
            dataType = dataTypes[fieldName];
            switch (dataType) {
                case "number":
                    for (i = 0; i < values.length; i++) {
                        val = values[i][fieldName];
                        if (!isUndefined(val)) {
                            values[i][fieldName] = +val;
                        }
                    }
                    break;
                case "boolean":
                    for (i = 0; i < values.length; i++) {
                        val = values[i][fieldName];
                        if (!isUndefined(val)) {
                            values[i][fieldName] = toBoolean(val);
                        }
                    }
                    break;
                case "date":
                    for (i = 0; i < values.length; i++) {
                        val = values[i][fieldName];
                        console.log("Val before:", val);
                        if (!isUndefined(val)) {
                            values[i][fieldName] = new Date(val);
                        }
                        console.log("Val after:", typeof values[i][fieldName], values[i][fieldName]);
                    }
                    break;
                default:
                    throw new Error("Can't apply data type, unrecognised data type " + dataType);
            }
        }
    };

    prototype.applyDataTypes = function () {
        var dataTypes = this.dataTypes(),
            values = this.values();
        this.applyDataTypesToValues(dataTypes, values);
    };

    return dataset;
})();

ggjs.dataset = function (s) {
    return new ggjs.Dataset(s);
};

ggjs.Data = (function () {
    var datasets = function (s) {
        var i, dataset;
        this.datasets = {};
        if (s) {
            for (i = 0; i < s.length; i++) {
                dataset = ggjs.dataset(s[i]);
                this.datasets[dataset.name()] = dataset;
            }
        }
    };

    var prototype = datasets.prototype;

    prototype.dataset = function (datasetName, dataset) {
        // ToDo: Get or set dataset
        if (arguments.length < 1) throw new Error("dataset function needs datasetName argument.");
        if (arguments.length === 1) return this.datasets[datasetName];
        // ToDo: set as object, ggjs dataset (or either)?
        this.datasets[datasetName] = ggjs.dataset(dataset);
        return this;
    };

    prototype.count = function () {
        return ggjs.util.countObjKeys(this.datasets);
    };

    prototype.names = function () {
        return ggjs.util.objKeys(this.datasets);
    };

    return datasets;
})();

ggjs.datasets = function (s) {
    return new ggjs.Data(s);
};

ggjs.Axis = (function() {
    var axis = function(spec) {
        spec = spec || {};
        if (ggjs.util.isUndefined(spec.type)) throw new Error("The axis type must be defined");
        this.axis = {
            type: spec.type,
            scaleName: spec.scaleName || null
        };
        //if (s) ggjs.extend(this.axis, s);
    };

    var prototype = axis.prototype;

    prototype.type = function (val) {
        if (!arguments.length) return this.axis.type;
        this.axis.type = val;
        return this;
    };

    prototype.scaleName = function(val) {
        if (!arguments.length) return this.axis.scaleName;
        // ToDo: set as object, ggjs scale (or either)?
        this.axis.scaleName = val;
        return this;
    };

    return axis;
})();

ggjs.axis = function (s) {
    return new ggjs.Axis(s);
};

ggjs.Axes = (function() {
    var axes = function(s) {
        var i, axis;
        this.axes = {};
        if (s) {
            for (i = 0; i < s.length; i++) {
                axis = ggjs.axis(s[i]);
                this.axes[axis.type()] = axis;
            }
        }
    };

    var prototype = axes.prototype;

    prototype.axis = function(axisType, axis) {
        // ToDo: Get or set axis
        if (arguments.length < 1) throw new Error("axis function needs axisType argument.");
        if (arguments.length == 1) return this.axes[axisType];
        this.axes[axisType] = ggjs.axis(axis);
        return this;
    };

    prototype.count = function() {
        return ggjs.util.countObjKeys(this.axes);
        // var size = 0, key;
     //    for (key in this.axes) {
     //        if (this.axes.hasOwnProperty(key)) size++;
     //    }
     //    return size;
    };

    return axes;
})();

ggjs.axes = function (s) {
    return new ggjs.Axes(s);
};

ggjs.Scale = (function () {
    var scale = function(spec) {
        this.scale = {
            type: spec.type || null,
            name: spec.name || null,
            domain: spec.domain || null,
            range: spec.range || null
        };
        //if (spec) ggjs.extend(this.scale, spec);
    };

    var prototype = scale.prototype;

    prototype.type = function(val) {
        if (!arguments.length) return this.scale.type;
        this.scale.type = val;
        return this;
    };

    prototype.name = function(val) {
        if (!arguments.length) return this.scale.name;
        this.scale.name = val;
        return this;
    };

    prototype.domain = function(val) {
        if (!arguments.length) return this.scale.domain;
        this.scale.domain = val;
        return this;
    };

    prototype.range = function(val) {
        if (!arguments.length) return this.scale.range;
        this.scale.range = val;
        return this;
    };

    prototype.hasDomain = function () {
        // Whether a domain is specified for the scale
        // Read only
        return this.domain() !== null;
    };

    prototype.hasRange = function () {
        // Whether a range is specified for the scale
        // Read only
        return this.range() !== null;
    };

    prototype.isQuantitative = function () {
        var quantScales = ["linear", "sqrt", "pow", "log"];
        return ggjs.util.array.contains(quantScales, this.type());
    };

    prototype.isOrdinal = function () {
        var ordinalScales = ["ordinal", "category10", "category20", "category20b", "category20c"];
        return ggjs.util.array.contains(ordinalScales, this.type());
    };

    prototype.isTime = function () {
        var timeScales = ["time"];
        return ggjs.util.array.contains(timeScales, this.type());
    };

    return scale;
})();

ggjs.scale = function (s) {
    return new ggjs.Scale(s);
};

ggjs.Scales = (function() {
    var scales = function(s) {
        var i, scale;
        this.scales = {};
        if (s) {
            for (i = 0; i < s.length; i++) {
                scale = ggjs.scale(s[i]);
                this.scales[scale.name()] = scale;
            }
        }
    };

    var prototype = scales.prototype;

    prototype.scale = function(scaleName, scale) {
        // Gets or set scale by name
        if (arguments.length < 1) throw new Error("scale function needs scaleName argument.");
        if (arguments.length == 1) return this.scales[scaleName];
        this.scales[scaleName] = ggjs.scale(scale);
        return this;
    };

    prototype.count = function() {
        var size = 0, key;
        for (key in this.scales) {
            if (this.scales.hasOwnProperty(key)) size++;
        }
        return size;
    };

    return scales;
})();

ggjs.scales = function (s) {
    return new ggjs.Scales(s);
};

ggjs.Padding = (function () {
    var padding = function(s) {
        this.padding = {
            left: s.left || 40,
            right: s.right || 20,
            top: s.top || 20,
            bottom: s.bottom || 70
        };
        //if (s) ggjs.extend(this.padding, s);
    };

    var prototype = padding.prototype;

    prototype.left = function (l) {
        if (!arguments.length) return this.padding.left;
        this.padding.left = l;
        return this;
    };

    prototype.right = function (r) {
        if (!arguments.length) return this.padding.right;
        this.padding.right = r;
        return this;
    };

    prototype.top = function (t) {
        if (!arguments.length) return this.padding.top;
        this.padding.top = t;
        return this;
    };

    prototype.bottom = function (b) {
        if (!arguments.length) return this.padding.bottom;
        this.padding.bottom = b;
        return this;
    };

    return padding;
})();

ggjs.padding = function (s) {
    return new ggjs.Padding(s);
};

ggjs.AesMapping = (function () {
    // Aesthetic mapping shows which variables are mapped to which
    // aesthetics. For example, we might map weight to x position, 
    // height to y position, and age to size. 
    // 
    // GGPlot:
    //      layer(aes(x = x, y = y, color = z))
    // Ref [lg] 3.1.1
    var aesmap = function(s) {
        this.aesmap = {
            aes: s.aes || null,
            field: s.field || null,
            scaleName: s.scaleName || null
        };
        //if (s) ggjs.extend(this.aesmap, s);
    };

    var prototype = aesmap.prototype;

    prototype.aes = function (val) {
        if (!arguments.length) return this.aesmap.aes;
        this.aesmap.aes = val;
        return this;
    };

    prototype.field = function (val) {
        if (!arguments.length) return this.aesmap.field;
        this.aesmap.field = val;
        return this;
    };

    prototype.scaleName = function (val) {
        if (!arguments.length) return this.aesmap.scaleName;
        this.aesmap.scaleName = val;
        return this;
    };

    return aesmap;
})();

ggjs.aesmapping = function (s) {
    return new ggjs.AesMapping(s);
};

ggjs.AesMappings = (function () {
    var aesmappings = function(spec) {
        var i;
        this.aesmappings = [];
        for (i = 0; i < spec.length; i++) {
            this.aesmappings.push(ggjs.aesmapping(spec[i]));
        }
    };

    var prototype = aesmappings.prototype;

    prototype.findByAes = function (aesName) {
        // Finds an aesthetic mapping by aesthetic name
        var mappings = this.aesmappings,
            i, tmpAesmap;
        for (i = 0; i < mappings.length; i++) {
            tmpAesmap = mappings[i];
            if (tmpAesmap.aes() === aesName) {
                return tmpAesmap;
            }
        }
        return null;
    };

    prototype.count = function () {
        return this.aesmappings.length;
    };

    prototype.asArray = function () {
        return this.aesmappings;
    };

    return aesmappings;
})();

ggjs.aesmappings = function (s) {
    return new ggjs.AesMappings(s);
};

ggjs.Geom = (function () {
    var geom = function(s) {
        this.geom = {
            // Support JSON-LD type Geom type
            geomType: s.geomType || s["@type"] || "GeomBar"
        };
    };

    var prototype = geom.prototype;

    prototype.geomType = function (l) {
        if (!arguments.length) return this.geom.geomType;
        this.geom.geomType = l;
        return this;
    };

    return geom;
})();

ggjs.geom = function (s) {
    return new ggjs.Geom(s);
};

// Helper for drawing GeoJSON layers
ggjs.geomGeoJSON = (function (d3) {
    // TODO: Simplify function signature so it takes render object and layer def
    var drawGeoJSONLayer = function (svgElem, values, aesmappings, xField, yField, xScale, yScale,
            projection, path, zoom) {
            // Draws GeoJSON onto the plot area

            // Working projection for UK
            // var projection = d3.geo.mercator()
            //     .center([0, 5 ])
            //     .scale(5000)
            //     .rotate([3,-48]);

            // var projection = d3.geo.mercator()
            //     .center([0, 51])
            //     .scale(900)
            //     .rotate([0, 0]);
            // var path = d3.geo.path()
            //         .projection(projection),
            //     svg = plotArea;


            console.log("drawing geojson layer.");
            console.log("values", values);

            // TODO: Only draws FeatureCollection at the moment
            // TODO: Check the geojson type
            svgElem.append("g")
                    .attr("class", "counties")
                .selectAll("path")
                    .data(values.features)
                .enter().append("path")
                    // .attr("class", function(d) { return quantize(rateById.get(d.id)); })
                    .attr("fill", "rgba(0,0,0,0.2)")
                    .attr("stroke", "black")
                    .attr("stroke-width", "1")
                    .attr("d", path);
            
            // var vector2 = plot.append("g")
            //     .attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");

            // vector2.selectAll("circle")
            //     .data(values)
            //     .enter().append("circle")
            //         .attr("transform", function(d) {return "translate(" + projection([ +d[yField], +d[xField] ]) + ")";})
            //         .attr("r", 5 / zoom.scale())
            //         .attr("fill", "rgba(255,0,0,0.6)")
            //         .attr(dataAttrXField, xField)
            //         .attr(dataAttrXValue, function (d) { return d[xField]; })
            //         .attr(dataAttrYField, yField)
            //         .attr(dataAttrYValue, function (d) { return d[yField]; });
            var zoomedRedraw = function () {
                // Function to redraw content when zoom/pan changes. See zoomed function
                // in renderer.
                // TODO: limit so only this layer's paths are redrawn
                console.log("GeoJSON zoomed.");
                svgElem.selectAll("path")
                    .attr("d", path);
            };

            return zoomedRedraw;
        };
    return {
        drawGeoJSONLayer: drawGeoJSONLayer
    };
}(d3));
ggjs.Layer = (function () {
    // Layers are responsible for creating the objects that we perceive on the plot. 
    // A layer is composed of:
    //  - data and aesthetic mapping,
    //  - a statistical transformation (stat),
    //  - a geometric object (geom), and
    //  - a position adjustment
    // 
    // GGPlot:
    //      layer(aes(x = x, y = y, color = z), geom="line",
    //      stat="smooth")
    // Ref [lg] 3.1
    var layer = function(spec) {
        // ToDo: move Namespace info out into separate module
        var ggjsPrefix = "ggjs",
            fillAesMap, xAesMap;
        this.layer = {
            data: spec.data || null,
            geom: ggjs.geom(spec.geom || {}),
            // geom: spec.geom || null,
            position: spec.position || null,
            // Sometimes order id is prefixed because JSON-LD context
            // has conflicts with other vocabs using 'orderId'.
            orderId: spec.orderId || spec[ggjsPrefix + ":orderId"] || null,
            // Note: support 'aesmapping' as name for aesmapping collection as well
            // as 'aesmapping' to support Linked Data style naming
            aesmappings: ggjs.aesmappings(spec.aesmappings || spec.aesmapping || [])
        };
        //if (s) ggjs.extend(this.layer, s);

        fillAesMap = this.layer.aesmappings.findByAes("fill");
        xAesMap = this.layer.aesmappings.findByAes("x");

        // Set defaults
        if (this.geom().geomType() === "GeomBar" && this.position() === "stack" &&
            fillAesMap !== null && xAesMap !== null && 
            fillAesMap.field() !== xAesMap.field()) {
            this.layer.useStackedData = true;
        } else {
            this.layer.useStackedData = false;
        }
        
    };

    var prototype = layer.prototype;

    prototype.data = function (val) {
        if (!arguments.length) return this.layer.data;
        this.layer.data = val;
        return this;
    };

    prototype.geom = function (val) {
        if (!arguments.length) return this.layer.geom;
        this.layer.geom = val;
        return this;
    };

    prototype.position = function (val) {
        if (!arguments.length) return this.layer.position;
        this.layer.position = val;
        return this;
    };

    prototype.orderId = function (val) {
        if (!arguments.length) return this.layer.orderId;
        this.layer.orderId = val;
        return this;
    };

    prototype.aesmappings = function (val) {
        if (!arguments.length) return this.layer.aesmappings;
        // ToDo: should val be obj or Axes (or either)?
        this.layer.aesmappings = val;
        return this;
    };

    prototype.useStackedData = function (val) {
        if (!arguments.length) return this.layer.useStackedData;
        this.layer.useStackedData = val;
        return this;
    };

    // prototype.useStackedData = function () {
    //  if (this.geom() === "bar" && this.position() === "stack") {
    //      return true;
    //  }
    //  return false;
    // }

    return layer;
})();

ggjs.layer = function(s) {
    return new ggjs.Layer(s);
};

ggjs.Layers = (function () {
    var layers = function(spec) {
        var isNullOrUndefined = ggjs.util.isNullOrUndefined,
            i;
        this.layers = [];
        for (i = 0; i < spec.length; i++) {
            this.layers.push(ggjs.layer(spec[i]));
        }
        // Sort layers by orderId
        this.layers.sort(function (lhs, rhs) {
            var lhsOrderId = isNullOrUndefined(lhs.orderId()) ? 0 : lhs.orderId(),
                rhsOrderId = isNullOrUndefined(rhs.orderId()) ? 0 : rhs.orderId();
            return lhsOrderId - rhsOrderId;
        });
    };

    var prototype = layers.prototype;

    prototype.count = function () {
        return this.layers.length;
    };

    prototype.asArray = function () {
        return this.layers;
    };

    return layers;
})();

ggjs.layers = function(s) {
    return new ggjs.Layers(s);
};

ggjs.Plot = (function () {
    // The layered grammar defines the components of a plot as:
    //  - a default dataset and set of mappings from variables to aesthetics,
    //  - one or more layers, with each layer having one geometric object, one statistical 
    //    transformation, one position adjustment, and optionally, one dataset and set of 
    //    aesthetic mappings,
    //  - one scale for each aesthetic mapping used,
    //  - a coordinate system,
    //  - the facet specification.
    // ref: [lg] 3.0
    var plot = function(spec) {
        this.plot = {
            // ToDo: get defaults from config?
            selector: spec.selector,
            // Note: let renderer set default width
            // width: spec.width || 500,
            width: spec.width,
            height: spec.height || 500,
            padding: ggjs.padding(spec.padding || {}),
            data: ggjs.datasets(spec.data || []),
            defaultDatasetName: null,
            // ToDo: automatically find co-ordinate system based on layers?
            coord: spec.coord || "cartesian",
            // Note: support 'scale' as name for scale collection as well
            // as 'scales' to support Linked Data style naming
            scales: ggjs.scales(spec.scales || spec.scale || []),
            // Note: support 'axis' as name for axis collection as well
            // as 'axes' to support Linked Data style naming
            axes: ggjs.axes(spec.axes || spec.axis || []),
            facet: spec.facet || null,
            // Note: support 'layer' as name for layers collection as well
            // as 'layers' to support Linked Data style naming
            layers: ggjs.layers(spec.layers || spec.layer || [])
        };
        //if (spec) ggjs.extend(this.plot, spec);
    };

    var prototype = plot.prototype;

    prototype.selector = function (val) {
        if (!arguments.length) return this.plot.selector;
        this.plot.selector = val;
        return this;
    };

    prototype.width = function (val) {
        if (!arguments.length) return this.plot.width;
        this.plot.width = val;
        return this;
    };

    prototype.height = function (val) {
        if (!arguments.length) return this.plot.height;
        this.plot.height = val;
        return this;
    };

    prototype.padding = function (val) {
        if (!arguments.length) return this.plot.padding;
        this.plot.padding = ggjs.padding(val);
        return this;
    };

    prototype.coord = function (val) {
        if (!arguments.length) return this.plot.coord;
        this.plot.coord = val;
        return this;
    };

    prototype.data = function (val) {
        if (!arguments.length) return this.plot.data;
        // ToDo: should val be obj or Datasets (or either)?
        this.plot.data = val;
        return this;
    };

    prototype.axes = function (val) {
        if (!arguments.length) return this.plot.axes;
        // ToDo: should val be obj or Axes (or either)?
        this.plot.axes = val;
        return this;
    };

    prototype.scales = function (val) {
        if (!arguments.length) return this.plot.scales;
        // ToDo: should val be obj or Scales (or either)?
        this.plot.scales = val;
        return this;
    };

    prototype.layers = function (val) {
        if (!arguments.length) return this.plot.layers;
        // ToDo: should val be obj or Layers (or either)?
        this.plot.layers = val;
        return this;
    };

    // ----------------------
    // Plot area information
    // ----------------------

    prototype.plotAreaWidth = function () {
        // ToDo: take axis titles and legends size away from width
        return this.width() - this.padding().left() - this.padding().right();
    };

    prototype.plotAreaHeight = function () {
        // ToDo: take axis titles, plot title, legends size away from height
        return this.height() - this.padding().top() - this.padding().bottom();
    };

    prototype.plotAreaX = function () {
        // ToDo: add axis titles and legends size
        return this.padding().left();
    };

    prototype.plotAreaY = function () {
        // ToDo: add axis titles, plot title and legends size
        return this.padding().top();
    };

    // ----------------------
    // Axis information
    // ----------------------

    prototype.yAxisHeight = function () {
        switch (this.coord()) {
            case "cartesian":
                return this.plotAreaHeight();
            case "polar":
                return Math.floor(this.plotAreaHeight() / 2);
            default:
                throw new Error("Can't get y axis height, unknown co-ordinate system " + this.coord()); 
        }
    };

    // ----------------------
    // Data information
    // ----------------------

    prototype.defaultDatasetName = function (val) {
        if (!arguments.length) {
            if (this.plot.defaultDatasetName !== null) {
                return this.plot.defaultDatasetName;
            } else if (this.plot.data.count() === 1) {
                // Treat sole dataset as default data
                return this.plot.data.names()[0];
            } else {
                return null;
            }
        }
        this.plot.defaultDatasetName = val;
        return this;
    };

    return plot;
})();

ggjs.plot = function(p) {
    return new ggjs.Plot(p);
};

// Create a registration system for plot layer renderers
ggjs.layerRendererPlugins = (function () {
    var layerRendererPlugins = {},
        createKey = function (rendererType, coord, geom) {
            return rendererType + "_" + coord + "_" + geom;
        },
        addLayerRenderer = function (rendererType, coord, geom, renderer) {
            // Adds a new layer renderer that can draw a plot layer
            var key = createKey(rendererType, coord, geom);
            layerRendererPlugins[key] = renderer;
        },
        getLayerRenderer = function (rendererType, coord, geom) {
            // Gets a layer renderer that can draw a plot layer
            var key = createKey(rendererType, coord, geom),
                renderer = layerRendererPlugins[key];
            return renderer || null;
        };
    return {
        addLayerRenderer: addLayerRenderer,
        getLayerRenderer: getLayerRenderer
    };
}());
// TODO: Put these in Layer base class, or swap out
// for option to set row data on data point (e.g. data-ggjs-rowdata)
var geomDataAttrXField = "data-ggjs-x-field",
    geomDataAttrXValue = "data-ggjs-x-value",
    geomDataAttrYField = "data-ggjs-y-field",
    geomDataAttrYValue = "data-ggjs-y-value";

// Layer renderer plugin for Leaflet map tiles
(function (L, layerRendererPlugins) {
    var rendererType = "leaflet",
        // onAdd = function (map) {
        //     // Add new layer
        //     map.addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
        // },
        // onRemove = function (map) {
        //     throw new Error("Not implemented.");
        // },
        // renderer = {
        //     onAdd: onAdd,
        //     onRemove: onRemove
        // },
        layerRenderer = function (plotSettings, layerDef) {
            this._plotSettings = plotSettings;
            this._layerDef = layerDef;
            // this.map(map);
        },
        registerLayerRenderer = function (renderer) {
            var coord = "mercator",
                geom = "GeomGeoTiles";
            layerRendererPlugins.addLayerRenderer(rendererType, coord, geom, renderer);
        };

    var prototype = layerRenderer.prototype;

    prototype.onAdd = function (map) {
        // Add new layer
        map.addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
    };
    prototype.onRemove = function (map) {
        throw new Error("Not implemented.");
    };

    // Register plugin
    registerLayerRenderer(layerRenderer);
    // registerLayerRenderer(renderer);
}(L, ggjs.layerRendererPlugins));

// Layer renderer plugin for Leaflet GeoJSON
(function (L, d3, layerRendererPlugins) {
    // Create a class that implements the Layer interface
    var rendererType = "leaflet",
        D3Layer = L.Class.extend({

            initialize: function(data) {
                this._data = data;
            },

            onAdd: function(map) {
                var collection = this._data;
                var svg = d3.select(map.getPanes().overlayPane).append("svg"),
                g = svg.append("g").attr("class", "leaflet-zoom-hide");

            var transform = d3.geo.transform({point: projectPoint}),
                  path = d3.geo.path().projection(transform);

              var feature = g.selectAll("path.ggjs-geo-geojson-path")
                  .data(collection.features)
                .enter().append("path")
                    .attr("class", "ggjs-geo-geojson-path");

              map.on("viewreset", reset);
              reset();

              // Reposition the SVG to cover the features.
              function reset() {
                var bounds = path.bounds(collection),
                    topLeft = bounds[0],
                    bottomRight = bounds[1];

                svg .attr("width", bottomRight[0] - topLeft[0])
                    .attr("height", bottomRight[1] - topLeft[1])
                    .style("left", topLeft[0] + "px")
                    .style("top", topLeft[1] + "px");

                g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

                feature.attr("d", path);
              }

              // Use Leaflet to implement a D3 geometric transformation.
              function projectPoint(x, y) {
                var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
              }

                /*

                // Create SVG elements under the overlay pane
                var div = d3.select(map.getPanes().overlayPane),
                    svg = div.selectAll('svg.point').data(this._data);

                // Stores the latitude and longitude of each city
                this._data.forEach(function(d) {
                    d.LatLng = new L.LatLng(d.coordinates[0], d.coordinates[1]);
                });

                // Create a scale for the population
                var rScale = d3.scale.sqrt()
                    .domain([0, d3.max(this._data, function(d) { return d.population; })])
                    .range([0, 35]);

                // Append the SVG containers for the bubbles
                svg.enter().append('svg')
                    .attr('width', function(d) { return 2 * rScale(d.population); })
                    .attr('height', function(d) { return 2 * rScale(d.population); })
                    .attr('class', 'point leaflet-zoom-hide')
                    .style('position', 'absolute');

                // Append the bubbles (finally!)
                svg.append('circle')
                    .attr('cx', function(d) { return rScale(d.population); })
                    .attr('cy', function(d) { return rScale(d.population); })
                    .attr('r', function(d) { return rScale(d.population); })
                    .attr('class', 'city')
                    .on('mouseover', function(d) {
                        d3.select(this).classed('highlight', true);
                    })
                    .on('mouseout', function(d) {
                        d3.select(this).classed('highlight', false);
                    });


                function updateBubbles() {
                    svg
                        .style('left', function(d) {
                            var dx = map.latLngToLayerPoint(d.LatLng).x;
                            return (dx - rScale(d.population)) + 'px';
                        })
                        .style('top', function(d) {
                            var dy = map.latLngToLayerPoint(d.LatLng).y;
                            return (dy - rScale(d.population)) + 'px';
                        });
                }

                map.on('viewreset', updateBubbles);
                updateBubbles();

                */
            },

            onRemove: function(map) {
                // var div = d3.select(map.getPanes().overlayPane);
                // div.selectAll('svg.point').remove();
            }
        }),
        // onAdd = function (map, values) {
        //     // Create a layer with data
        //     map.addLayer(new D3Layer(values));
        // },
        // onRemove = function (map) {
        //     throw new Error("Not implemented.");
        // },
        // renderer = {
        //     onAdd: onAdd,
        //     onRemove: onRemove
        // },
        layerRenderer = function (plotSettings, layerDef) {
            this._plotSettings = plotSettings;
            this._layerDef = layerDef;
            // this.map(map);
        },
        registerLayerRenderer = function (renderer) {
            var coord = "mercator",
                geom = "GeomGeoJSON";
            console.log("Registering renderer", coord, geom);
            layerRendererPlugins.addLayerRenderer(rendererType, coord, geom, renderer);
        };

    var prototype = layerRenderer.prototype;

    // TODO: move to 'base class'?
    prototype.plotSettings = function (val) {
        if (!arguments.length) return this._plotSettings;
        this._plotSettings = val;
        return this;
    };

    // TODO: move to 'base class'?
    prototype.layerDef = function (val) {
        if (!arguments.length) return this._layerDef;
        this._layerDef = val;
        return this;
    };

    prototype.onAdd = function (map) {
        var plotSettings = this.plotSettings(),
            layerDef = this.layerDef(),
            datasetName = layerDef.data(),
            dataset = plotSettings.getDataset(datasetName),
            //dataset = plotDef.data().dataset(datasetName),
            values = dataset.values();

        // Create a layer with data
        map.addLayer(new D3Layer(values));
    };

    prototype.onRemove = function (map) {
        throw new Error("Not implemented.");
    };

    // Register plugin
    registerLayerRenderer(layerRenderer);
    // registerLayerRenderer(renderer);
}(L, d3, ggjs.layerRendererPlugins));

// Layer renderer plugin for Leaflet GeomPoint
(function (L, d3, layerRendererPlugins) {
    // Create a class that implements the Layer interface
    var rendererType = "leaflet",
        // Create a class that implements the Layer interface
        D3Layer = L.Class.extend({
            // Note: based on example in Chapter 10 of Mastering D3 book

            initialize: function(data, latField, longField) {
                console.log("init geopoints layer");
                console.log("data", data);
                console.log("latField", latField);
                console.log("longField", longField);
                this._data = data;
                this._latField = latField;
                this._longField = longField;
                this._bounds = new L.LatLngBounds([]);
            },

            onAdd: function(map) {

                // Create SVG elements under the overlay pane
                var div = d3.select(map.getPanes().overlayPane),
                    svg = div.selectAll('svg.point').data(this._data),
                    latField = this._latField,
                    longField = this._longField,
                    allLatLongs = [];

                // Stores the latitude and longitude of each city
                this._data.forEach(function(d) {
                    d.LatLng = new L.LatLng(+d[latField], +d[longField]);
                    allLatLongs.push(d.LatLng);
                });
                this._bounds = new L.LatLngBounds(allLatLongs);

                // Create a scale for the population
                // TODO: put in scale for size
                // var rScale = d3.scale.sqrt()
                //     .domain([0, d3.max(this._data, function(d) { return d.population; })])
                //     .range([0, 35]);
                var radius = 5;

                // Append the SVG containers for the bubbles
                svg.enter().append('svg')
                    // .attr('width', function(d) { return 2 * rScale(d.population); })
                    // .attr('height', function(d) { return 2 * rScale(d.population); })
                    .attr('width', function(d) { return 2 * radius; })
                    .attr('height', function(d) { return 2 * radius; })
                    .attr('class', 'point leaflet-zoom-hide')
                    .style('position', 'absolute');

                // Append the bubbles
                // TODO: put in fill colour scale
                svg.append('circle')
                    // .attr('cx', function(d) { return rScale(d.population); })
                    // .attr('cy', function(d) { return rScale(d.population); })
                    // .attr('r', function(d) { return rScale(d.population); })
                    .attr('cx', function(d) { return radius; })
                    .attr('cy', function(d) { return radius; })
                    .attr('r', function(d) { return radius; })
                    .attr(geomDataAttrXField, latField)
                    .attr(geomDataAttrXValue, function (d) { return d[latField]; })
                    .attr(geomDataAttrYField, longField)
                    .attr(geomDataAttrYValue, function (d) { return d[longField]; })
                    .attr('class', 'city');
                    // .on('mouseover', function(d) {
                    //     d3.select(this).classed('highlight', true);
                    // })
                    // .on('mouseout', function(d) {
                    //     d3.select(this).classed('highlight', false);
                    // });


                function updateBubbles() {
                    svg
                        .style('left', function(d) {
                            var dx = map.latLngToLayerPoint(d.LatLng).x;
                            return (dx - radius) + 'px';
                            // TODO: put radius scale in:
                            // return (dx - rScale(d.population)) + 'px';
                        })
                        .style('top', function(d) {
                            var dy = map.latLngToLayerPoint(d.LatLng).y;
                            return (dy - radius) + 'px';
                            // TODO: put radius scale in:
                            // return (dy - rScale(d.population)) + 'px';
                        });
                }

                map.on('viewreset', updateBubbles);
                updateBubbles();
            },

            onRemove: function(map) {
                var div = d3.select(map.getPanes().overlayPane);
                div.selectAll('svg.point').remove();
            }
        }),
        // onAdd = function (map) {
        //     // Create a layer with data
        //     var plotDef = this.plotDef(),
        //         aesmappings = layerDef.aesmappings(),
        //         xField = aesmappings.findByAes("x").field(),
        //         yField = aesmappings.findByAes("y").field(),
        //         // xScale = this.xAxis().scale(),
        //         // yScale = this.yAxis().scale(),
        //         datasetName = layerDef.data(),
        //         dataset = this.getDataset(datasetName),
        //         //dataset = plotDef.data().dataset(datasetName),
        //         values = dataset.values();

        //     map.addLayer(new D3Layer(values));
        // },
        // onRemove = function (map) {
        //     throw new Error("Not implemented.");
        // },
        // renderer = {
        //     onAdd: onAdd,
        //     onRemove: onRemove
        // },
        layerRenderer = function (plotSettings, layerDef) {
            this.plotSettings(plotSettings);
            this.layerDef(layerDef);
            // this.map(map);
        },
        registerLayerRenderer = function (renderer) {
            var coord = "mercator",
                geom = "GeomPoint";
            console.log("Registering renderer", coord, geom);
            layerRendererPlugins.addLayerRenderer(rendererType, coord, geom, renderer);
        };

    var prototype = layerRenderer.prototype;

    // TODO: move to 'base class'?
    prototype.plotSettings = function (val) {
        if (!arguments.length) return this._plotSettings;
        this._plotSettings = val;
        return this;
    };

    // TODO: move to 'base class'?
    prototype.layerDef = function (val) {
        if (!arguments.length) return this._layerDef;
        this._layerDef = val;
        return this;
    };

    // prototype.map = function (val) {
    //     if (!arguments.length) return this._map;
    //     this._map = val;
    //     return this;
    // };

    prototype.onAdd = function (map) {
        // Create a layer with data
        var layerDef = this.layerDef(),
            aesmappings = layerDef.aesmappings(),
            xField = aesmappings.findByAes("x").field(),
            yField = aesmappings.findByAes("y").field(),
            // xScale = this.xAxis().scale(),
            // yScale = this.yAxis().scale(),
            datasetName = layerDef.data(),
            dataset = this.plotSettings().getDataset(datasetName),
            //dataset = plotDef.data().dataset(datasetName),
            values = dataset.values();

        // TODO: should fit bounds across all map layers
        // TODO: should check whether auto fit bounds is enabled
        var mapLayer = new D3Layer(values, xField, yField);
        map.addLayer(mapLayer);
        map.fitBounds(mapLayer._bounds);
    };

    prototype.onRemove = function (map) {
        throw new Error("Not implemented.");
    };

    // Register plugin
    registerLayerRenderer(layerRenderer);
    // registerLayerRenderer(renderer);
}(L, d3, ggjs.layerRendererPlugins));
// Base 'class' for plot renderers
ggjs.RendererBase = (function () {
    var baseRenderer = function () {
    };

    var prototype = baseRenderer.prototype;

    prototype.plotDef = function (val) {
        if (!arguments.length) return this._plotDef;
        this._plotDef = val;
        return this;
    };

    prototype.scaleDef = function (scaleName) {
        return this.plotDef().scales().scale(scaleName);
    };

    prototype.buildScales = function () {
        throw new Error("Override in sub class.");
    };

    prototype.setupXAxis = function () {
        throw new Error("Override in sub class.");
    };

    prototype.setupYAxis = function () {
        throw new Error("Override in sub class.");
    };

    prototype.drawAxes = function () {
        throw new Error("Override in sub class.");
    };

    prototype.drawLayers = function () {
        throw new Error("Override in sub class.");
    };

    prototype.drawLegends = function () {
        throw new Error("Override in sub class.");
    };

    // ------------
    // Data ranges
    // ------------

    prototype.getDataset = function (datasetName) {
        var plotDef = this.plotDef(),
            dataset = plotDef.data().dataset(datasetName),
            datasetNames;
        if (dataset === null || typeof dataset === "undefined") {
            // Use default dataset for the plot
            datasetNames = plotDef.data().names();
            if (datasetNames.length !== 1) {
                throw new Error("Expected one DataSet in the Plot to use as the default DataSet");
            }
            datasetName = datasetNames[0];
            dataset = plotDef.data().dataset(datasetName);

            if (dataset === null) {
                throw new Error("Couldn't find a layer DataSet or a default DataSet.");
            }
        }
        return dataset;
    };

    prototype.statAcrossLayers = function (aes, stat) {
        // Looks at the data across all layers for an
        // aesthetic and gets info about it (e.g. max or min)
        var plotDef = this.plotDef(),
            layers = plotDef.layers().asArray(),
            statVal = null,
            i, layer, aesmap, field, tmpStat,
            datasetName, dataset;

        for (i = 0; i < layers.length; i++) {
            layer = layers[i];
            aesmap = layer.aesmappings().findByAes(aes);

            // Layer data
            datasetName = layer.data();
            if (!datasetName) {
                datasetName = plotDef.defaultDatasetName();
            }
            //dataset = plotDef.data().dataset(datasetName);
            dataset = this.getDataset(datasetName);
            if (dataset === null) {
                throw new Error("Unable to find dataset with name " + datasetName);
            }

            if (aesmap) {
                field = aesmap.field();
                if (stat === "max" && layer.useStackedData()) {
                    // Stack data
                    tmpStat = this.layerStackedDataMax(layer, dataset, aes);
                } else {
                    // Normal case for finding aes value
                    tmpStat = ggjs.dataHelper.datatableStat(dataset.values(), field, stat);
                }
                if (!isNaN(tmpStat)) {
                    if (statVal === null) statVal = tmpStat;
                    statVal = stat === "min" ? Math.min(statVal, tmpStat) : Math.max(statVal, tmpStat);
                }
            }
        }

        return statVal;
    };

    prototype.layerStackedDataMax = function (layer, dataset, aes) {
        // Find the max value for the stacked data on this level.
        // Highest value for stacked data is sum of values in group, 
        // not the highest value across the whole value column
        var tmpStat,
            xAes = layer.aesmappings().findByAes("x"), 
            fillAes = layer.aesmappings().findByAes("fill"),
            valueAes = layer.aesmappings().findByAes(aes);

        if (valueAes === null) {
            throw new Error("Need value aes map to find stacked value");
        }
        if (xAes === null) {
            throw new Error("Need x aes map to find stacked value");
        }
        if (fillAes === null) {
            throw new Error("Need fill aes map to find stacked value");
        }

        if (aes === "y") {
            // ToDo: is the fill aes the only way to specify stacked figures?
            tmpStat = ggjs.dataHelper.maxStackValue(dataset.values(), 
                xAes.field(), fillAes.field(), valueAes.field());
        } else {
            throw new Error("Don't know how to find stacked value for value aes " + aes);
        }

        return tmpStat;
    };

    prototype.allValuesForLayer = function (layer, aesmap) {
        // Gets all data values for an aes in a layer
        var plotDef = this.plotDef(),
            values = [],
            //tmpVals, 
            i, field,
            datasetName, dataset;

        // Layer data
        datasetName = layer.data();
        if (!datasetName) {
            datasetName = plotDef.defaultDatasetName();
        }
        dataset = this.getDataset(datasetName);
        if (dataset === null) {
            throw new Error("Unable to find dataset with name " + datasetName);
        }

        if (aesmap) {
            field = aesmap.field();
            
            if (dataset.values().map) {
                values = dataset.values().map(function (d) { return d[field]; });
            } else {
                // backup way to get values from data
                // ToDo: use array.map polyfill so this can be removed?
                var dsVals = dataset.values(),
                    j;
                this.warning("Old browser - doesn't support array.map");
                for (j = 0; j < dsVals.length; j++) {
                    values.push(dsVals[j][field]);
                }
            }
            // values = d3.merge([ values, tmpVals ]);
        }

        return values;
    };

    prototype.allValuesAcrossLayers = function (aes) {
        // Looks at the data across all layers for an
        // aesthetic and gets all it's values
        var plotDef = this.plotDef(),
            layers = plotDef.layers().asArray(),
            values = [],
            tmpVals, i, layer, aesmap, field,
            datasetName, dataset;

        for (i = 0; i < layers.length; i++) {
            layer = layers[i];
            aesmap = layer.aesmappings().findByAes(aes);

            tmpVals = this.allValuesForLayer(layer, aesmap);
            values = values.concat(tmpVals);
            // values = d3.merge([ values, tmpVals ]);

            // // Layer data
            // datasetName = layer.data();
            // if (!datasetName) {
            //  datasetName = plotDef.defaultDatasetName();
            // }
            // //dataset = plotDef.data().dataset(datasetName);
            // dataset = this.getDataset(datasetName);
            // if (dataset == null) {
            //  throw "Unable to find dataset with name " + datasetName;
            // }

            // if (aesmap) {
            //  field = aesmap.field();
                
            //  if (dataset.values().map) {
            //      tmpVals = dataset.values().map(function (d) { return d[field]; });
            //  } else {
            //      // backup way to get values from data
            //      // ToDo: use array.map polyfill so this can be removed?
            //      var tmpVals = [],
            //          dsVals = dataset.values(),
            //          j;
            //      this.warning("Old browser - doesn't support array.map");
            //      for (j = 0; j < dsVals.length; j++) {
            //          tmpVals.push(dsVals[j][field]);
            //      }
            //  }
            //  values = d3.merge([ values, tmpVals ]);
            // }
        }

        return values;
    };

    return baseRenderer;
}());


// Base 'class' for D3 renderers
ggjs.D3RendererBase = (function (d3) {
    var d3RendererBase = function () {
    };

    // 'Inherit' base class prototype
    var prototype = ggjs.util.extend(d3RendererBase.prototype, ggjs.RendererBase.prototype);



    // -------
    // Scales
    // -------

    prototype.d3Scale = function (scaleName, val) {
        if (!arguments.length) {
            throw new Error("Must supply args when getting/setting d3 scale");
        }

        // if (ggjs.util.isUndefined(this._scaleNameToD3Scale)) {
        //     this._scaleNameToD3Scale = {};
        // }

        else if (arguments.length === 1) {
            return this._scaleNameToD3Scale[scaleName];
            // return this.renderer.scaleNameToD3Scale[scaleName];
        } else {
            this._scaleNameToD3Scale[scaleName] = val;
            // this.renderer.scaleNameToD3Scale[scaleName] = val;
        }
        
        return this;
    };

    prototype.setupAxisScale = function (aes, scale, scaleDef) {
        var min = 0,
            max,
            allValues = [];

        
        if (scaleDef.hasDomain()) {
            scale.domain(scaleDef.domain());
        } else {
            // If scale domain hasn't been set, use data to find it
            if (scaleDef.isQuantitative()) {
                max = this.statAcrossLayers(aes, "max");
                if (!isNaN(max)) {
                    scale.domain([0, max]).nice();
                }
            } else if (scaleDef.isOrdinal()) {
                allValues = this.allValuesAcrossLayers(aes);
                scale.domain(allValues);
                //scale.domain(data.map(function(d) { return d.letter; }));
            } else if (scaleDef.isTime()) {
                min = this.statAcrossLayers(aes, "min");
                max = this.statAcrossLayers(aes, "max");
                if (isNaN(min)) {
                    min = new Date(1970, 0, 1);
                }
                if (isNaN(max)) {
                    max = new Date(Date.now());
                }
                scale.domain([min, max]).nice();
            }
        }
        
    };

    prototype.buildScales = function () {
        var plotDef = this.plotDef(),
            layerDefs = plotDef.layers().asArray(),
            i, j,
            // scaleNamesLookup = {},
            // scaleNames = [],
            scaleNameToLayerInfos = {},
            // scaleNameToLayer = {},
            // scaleNameToAesMap = {},
            scaleDef,
            layerInfo,
            layerInfos,
            layerDef,
            tmpScale,
            values,
            tmpVals,
            min, max,
            aesmappings, aesmapping, aes, scaleName, scale;

        // Find names of all the scales used
        for (i = 0; i < layerDefs.length; i++) {
            layerDef = layerDefs[i];
            aesmappings = layerDef.aesmappings().asArray();

            // console.log("aesmappings", aesmappings)
            if (aesmappings) {
                for (j = 0; j < aesmappings.length; j++) {
                    aesmapping = aesmappings[j];
                    // console.log(aesmapping)
                    aes = aesmapping.aes();
                    // Skip aesthetics which are already display as axis
                    // if (aes === "x" || aes === "y") {
                    //  continue;
                    // }
                    scaleName = aesmapping.scaleName();
                    if (scaleName === null) {
                        continue;
                    }
                    // Store the information about where scale is used
                    layerInfo = {
                        layerDef: layerDef,
                        aesmapping: aesmapping
                    };
                    if (typeof scaleNameToLayerInfos[scaleName] === 'undefined') {
                        scaleNameToLayerInfos[scaleName] = [layerInfo];
                    } else {
                        scaleNameToLayerInfos[scaleName].push(layerInfo);
                    }
                    
                    // scaleNameToLayer[scaleName] = layer;
                    // scaleNameToAesMap[scaleName] = aesmapping;
                    // console.log("aesmapping", aes, scaleName);
                    // if (scaleName != null && typeof scaleNamesLookup[scaleName] === 'undefined') {
                    //  scaleNames.push(scaleName);
                    //  scaleNamesLookup[scaleName] = true;
                    // }
                }
            }
        }

        // Create a D3 scale for each scale
        // console.log("Creating d3 scales")
        for (scaleName in scaleNameToLayerInfos) {
            scaleDef = plotDef.scales().scale(scaleName);
            scale = this.scale(scaleDef);
            if (scaleDef.hasDomain()) {
                scale.domain(scaleDef.domain());
            } else {
                // If scale domain hasn't been set, use data to find it
                if (scaleDef.isQuantitative()) {
                    max = this.statAcrossLayers(aes, "max");
                    if (!isNaN(max)) {
                        scale.domain([0, max]).nice();
                    }
                } else if (scaleDef.isOrdinal()) {
                    // Find values across all layers
                    layerInfos = scaleNameToLayerInfos[scaleName];
                    values = [];
                    // console.log("scaleName", scaleName)
                    for (i = 0; i < layerInfos.length; i++) {
                        layerInfo = layerInfos[i];
                        layerDef = layerInfo.layerDef;
                        aesmapping = layerInfo.aesmapping;
                        // ToDo: cache values for layer/field combos
                        // console.log("layer info", scaleName, layerDef.data(), aesmapping.aes(), aesmapping.field());
                        tmpVals = this.allValuesForLayer(layerDef, aesmapping);
                        values = d3.merge([ values, tmpVals ]);
                    }
                    scale.domain(values);
                } else if (scaleDef.isTime()) {
                    // min = this.statAcrossLayers(aes, "min");
                    // max = this.statAcrossLayers(aes, "max");
                    // if (!isNaN(max)) {
                    //  scale.domain([0, max]).nice();
                    // }
                    console.log("setting time scale domain");
                    min = new Date(2014);
                    max = new Date(2016);
                    scale.domain([min, max]).nice();
                }
            }
            
            this.d3Scale(scaleName, scale);
        }
    };

    prototype.scale = function (scaleDef) {
        // Produces D3 scale from ggjs scale definition
        var scale = null;
        scaleDef = scaleDef || ggjs.scale({});
        switch (scaleDef.type()) {
            case "linear":
                scale = d3.scale.linear();
                break;
            case "ordinal":
                scale = d3.scale.ordinal();
                break;
            case "pow":
                scale = d3.scale.pow();
                break;
            case "time":
                scale = d3.time.scale();
                break;
            case "category10":
                scale = d3.scale.category10();
                break;
            default:
                throw new Error("Unknow D3 scale type " + scaleDef.type());
        }

        if (scale === null) {
            scale = d3.scale.linear();
        }

        return scale;
    };


    // -----
    // Axes
    // -----

    prototype.setupXAxis = function () {
        // Produces D3 x axis
        var plotDef = this.plotDef(),
            axis = d3.svg.axis()
                .orient("bottom"),
            axisDef = this.plotDef().axes().axis("x") || {},
            scaleRef = axisDef.scaleName(),
            scaleDef = plotDef.scales().scale(scaleRef),
            scale = this.scale(scaleDef);

        // ToDo: determine if domain has been manually set on x axis
        // ToDo: account for facets
        //x.domain(d3.extent(data, function(d) { return d.sepalWidth; })).nice();

        // Set scale range
        // ToDo: account for facets
        switch (plotDef.coord()) {
            case "cartesian":
                // X scale range is always width of plot area
                scale.range([0, plotDef.plotAreaWidth()]);
                if (scaleDef.isOrdinal()) {
                    scale.rangeRoundBands([0, plotDef.plotAreaWidth()], 0.1);
                }
                break;
            case "polar":
                scale.range([0, 2 * Math.PI]);
                if (scaleDef.isOrdinal()) {
                    scale.rangeBands([0, 2 * Math.PI], 0);
                }
                break;
            case "mercator":
                console.log("ToDo: set up geo axis");
                break;
            default:
                throw new Error("Don't know how to set axis range for co-ordinate type " + plotDef.coord());
        }

        this.setupAxisScale("x", scale, scaleDef);
        axis.scale(scale);

        axis.ticks(5);

        this.xAxisScaleDef(scaleDef);
        this.xAxis(axis);
    };

    prototype.setupYAxis = function () {
        // Produces D3 y axis
        var plotDef = this.plotDef(),
            axis = d3.svg.axis()
                .orient("left"),
            axisDef = this.plotDef().axes().axis("y") || {},
            scaleRef = axisDef.scaleName(),
            scaleDef = plotDef.scales().scale(scaleRef),
            scale = this.scale(scaleDef);

        // ToDo: determine if domain has been manually set on y axis
        // ToDo: account for facets
        //y.domain(d3.extent(data, function(d) { return d.sepalLength; })).nice();
        
        // ToDo: account for facets
        switch (plotDef.coord()) {
            case "cartesian":
                // Y scale range is height of plot area
                scale.range([plotDef.plotAreaHeight(), 0]);
                break;
            case "polar":
                // Y scale range is half height of plot area
                scale.range([Math.floor(plotDef.plotAreaHeight() / 2), 0]);
                break;
            case "mercator":
                console.log("ToDo: set up geo axis");
                break;
            default:
                throw new Error("Don't know how to set axis range for co-ordinate type " + plotDef.coord());
        }

        this.setupAxisScale("y", scale, scaleDef);
        axis.scale(scale);

        axis.ticks(5);

        this.yAxisScaleDef(scaleDef);
        this.yAxis(axis);
    };

    prototype.xAxis = function (val) {
        if (!arguments.length) return this._xAxis;
        this._xAxis = val;
        return this;
    };

    prototype.yAxis = function (val) {
        if (!arguments.length) return this._yAxis;
        this._yAxis = val;
        return this;
    };

    prototype.xAxisScaleDef = function (val) {
        if (!arguments.length) return this._xAxisScaleDef;
        this._xAxisScaleDef = val;
        return this;
    };

    prototype.yAxisScaleDef = function (val) {
        if (!arguments.length) return this._yAxisScaleDef;
        this._yAxisScaleDef = val;
        return this;
    };


    // --------
    // Styling
    // --------

    prototype.defaultFillColor = function (val) {
        if (!arguments.length) return this._defaultFillColor;
        this._defaultFillColor = val;
        return this;
    };

    prototype.applyFillColour = function (svgItems, aesmappings) {
        // Applies fill colour to svg elements
        // Params:
        //  svgItems: the svg elements as D3 select list
        //  aesmappings: the layer's aesmappings

        // Fill colour
        // ToDo: setup colour scale across all layers, so colours
        // are matched across layers
        console.log("Warning: move colour mapping to all levels.");
        var plotDef = this.plotDef(),
            fillAesMap = aesmappings.findByAes("fill"),
            defaultFillColor = this.defaultFillColor();
        if (fillAesMap !== null) {
            var colorField = fillAesMap.field(),
                colorScaleDef = this.scaleDef(fillAesMap.scaleName()),
                scaleName = fillAesMap.scaleName(),
                colorScale;
            // if (colorScaleDef == null) {
            //  this.warning("Couldn't set colour on layer - fill colour scale missing.")
            //  svgItems.style("fill", function(d) { return defaultFillColor; });
            // } else {
            //  colorScale = this.scale(colorScaleDef);
            //  svgItems.style("fill", function(d) { return colorScale(d[colorField]); });
            // }
            
            if (scaleName === null) {
                this.warning("Couldn't set colour on layer - fill colour scale missing.");
                svgItems.style("fill", function(d) { return defaultFillColor; });
            } else {
                colorScale = this.d3Scale(scaleName);
                console.log("Using d3 scale", scaleName, colorScale.domain());
                svgItems.style("fill", function(d) { return colorScale(d[colorField]); });
            }   
        } else {
            svgItems.style("fill", function(d) { return defaultFillColor; });
        }
    };

    return d3RendererBase;
}(d3));
// SVG renderer
ggjs.SVGRenderer = (function (d3, layerRendererPlugins) {
    var svgRenderer = function (selector, plotDef) {
        this._plotDef = plotDef;

        // Width: autoset width if width is missing
        var width = this._plotDef.width(),
            parentWidth;
        if (typeof width === 'undefined' || width === null) {
            // Set width to parent container width
            try {
                parentWidth = d3.select(selector).node().offsetWidth;
                // parentWidth = d3.select(this._plotDef.selector()).node().offsetWidth;
            } catch (err) {
                throw new Error("Couldn't find the width of the parent element."); 
            }
            if (typeof parentWidth === 'undefined' || parentWidth === null) {
                throw new Error("Couldn't find the width of the parent element.");
            }
            this._plotDef.width(parentWidth);
        }

        // Set up hidden properties for base class methods
        // TODO: better to inherit these properties from base class
        this._xAxis = null;
        this._yAxis = null;
        this._xAxisScaleDef = null;
        this._yAxisScaleDef = null;
        this._scaleNameToD3Scale = {};
        this._defaultFillColor = "rgb(31, 119, 180)";

        // Names of data attributes which appear on SVG elements
        this.dataAttrXField = "data-ggjs-x-field";
        this.dataAttrXValue = "data-ggjs-x-value";
        this.dataAttrYField = "data-ggjs-y-field";
        this.dataAttrYValue = "data-ggjs-y-value";

        this.geo = {};

        // Clear the current contents
        d3.select(selector).html("");
        // d3.select(plotDef.selector()).html("");

        // Add the main SVG element
        plotSVG = d3.select(selector)
            .append("svg")
                .attr("width", plotDef.width())
                .attr("height", plotDef.height());
        this._plotSVG = plotSVG;
    };

    // 'Inherit' base class prototype
    var prototype = ggjs.util.extend(svgRenderer.prototype, ggjs.D3RendererBase.prototype);

    prototype.plotSVG = function (val) {
        if (!arguments.length) return this._plotSVG;
        this._plotSVG = val;
        return this;
    };

    prototype.rendererType = function () {
        return "svg";
    };

    // prototype.remove = function () {
    // };

    prototype.drawAxes = function () {
        var plotDef = this.plotDef(),
            plot = this.plotSVG();

        switch (plotDef.coord()) {
            case "cartesian":
                // Need an x and y axis
                // ToDo: support x2 and y2 axes
                //var xAxisDef = plotDef.axes().axis("x");
                var xAxis = this.xAxis(),
                    yAxis = this.yAxis(),
                    xAxisY = plotDef.plotAreaY() + plotDef.plotAreaHeight();
                plot.append("g")
                        .attr("class", "ggjs-x ggjs-axis")
                        .attr("transform", "translate(" + plotDef.plotAreaX() + "," + xAxisY + ")")
                        .call(xAxis)
                    // Tmp: orientate labels
                    .selectAll("text")
                        .attr("y", 5)
                        .attr("x", 4)
                        // .attr("dy", ".15em")
                        .attr("dy", "12px")
                        .attr("transform", "rotate(35)")
                        .style("text-anchor", "start");
                // ToDo: append x axis title
                plot.append("g")
                    .attr("class", "ggjs-y ggjs-axis")
                    .attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaY() + ")")
                    .call(yAxis);
                // ToDo: append x axis title

                break;
            case "polar":
                console.log("Draw polar axes");
                break;
            case "mercator":
                break;
            default:
                throw new Error("Unrecognised coordinate system used.");
        }
    };

    prototype.drawLayers = function () {
        var plotDef = this.plotDef(),
            plotSVG = this.plotSVG(),
            layerDefs = plotDef.layers().asArray(),
            i, layerDef, plotArea;

        // Setup layers
        // TODO: move this setup work up to renderPlot()
        switch (plotDef.coord()) {
            case "cartesian":
                plotArea = plotSVG.append("g")
                    .attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaY() + ")");
                break;
            case "polar":
                plotArea = plotSVG.append("g")
                    .attr("transform", "translate(" + (plotDef.plotAreaX() + Math.floor(plotDef.plotAreaWidth() / 2)) + "," + (plotDef.plotAreaY() + Math.floor(plotDef.plotAreaHeight() / 2)) + ")");
                break;
            case "mercator":
                //plotSVG.call(this.geo.zoom);
                plotArea = plotSVG.append("g")
                    .attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaY() + ")");
                //plotArea.on("zoom", function () {console.log("zooming")})
                var zoom = d3.behavior.zoom()
                    .scale(1 << 12)
                    .scaleExtent([1 << 9, 1 << 23])
                    .translate([250, 250])
                    .on("zoom", function () {console.log("zooming");});
                //plotArea.call(zoom);
                plotArea.on("mousemove", function () {console.log("mouse moved");});
                break;
        }

        // Draw each layer
        for (i = 0; i < layerDefs.length; i++) {
            layerDef = layerDefs[i];

            console.log("Drawing layer", layerDef.geom().geomType());

            switch (layerDef.geom().geomType()) {
                case "GeomPoint":
                    this.drawPointLayer(plotArea, layerDef);
                    break;
                case "GeomBar":
                    this.drawBarLayer(plotArea, layerDef);
                    break;
                case "GeomText":
                    this.drawTextLayer(plotArea, layerDef);
                    break;
                case "GeomLine":
                    this.drawLineLayer(plotArea, layerDef);
                    break;
                case "GeomPath":
                    this.drawPathLayer(plotArea, layerDef);
                    break;
                case "GeomGeoTiles":
                    this.drawMapTiles(plotArea, layerDef);
                    break;
                case "GeomGeoJSON":
                    this.drawGeoJSONLayer(plotArea, layerDef);
                    break;
                default:
                    throw new Error("Cannot draw layer, geom type not supported: " + layerDef.geom().geomType());
            }
        }



        /*
        // TODO: let parent renderer calling draw layers?
        var plotDef = this.plotDef(),
            coords = plotDef.coord(),
            // plot = this.renderer.plot,
            map = this._map,
            layerDefs = plotDef.layers().asArray(),
            i, layerDef, plotArea, layerRenderer, layerRendererConstr, geom;

        // Draw each layer
        for (i = 0; i < layerDefs.length; i++) {
            layerDef = layerDefs[i];

            var datasetName = layerDef.data(),
                dataset = this.getDataset(datasetName),
                values = dataset.values();

            geom = layerDef.geom().geomType();
            layerRendererConstr = layerRendererPlugins.getLayerRenderer(this.rendererType(), coords, geom);
            if (layerRendererConstr === null) {
                throw new Error("Couldn't find layer renderer for " + this.rendererType() + 
                    ", " + coords + ", " + geom);
            }

            // var plotSettings = {getDataset: this.getDataset};
            var plotSettings = this;
            layerRenderer = new layerRendererConstr(plotSettings, layerDef);

            layerRenderer.onAdd(map);
        }
        */
    };

    // --------
    // Legends
    // --------

    function scaleLegend () {
        // Legend attributes

        // Scale
        var _scale = null,
            _layout = "horizontal",
            _itemOffsetX = 0,   // Horizontal gap between items
            _itemOffsetY = 10,  // Vertical gap between items
            _itemRadius = Math.floor(_itemOffsetY / 2),
            _itemMarkerLabelGap = 10;

        // Legend function.
        function legend (selection) {
            selection.each(function (data) {
                var legendContainer = d3.select(this);

                legendContainer.selectAll(".ggjs-legend-item-marker")
                        .data(data)
                    .enter().append("circle")
                        .attr("class", "ggjs-legend-item-marker")
                        .attr("r", _itemRadius)
                        // .attr("cx", 0)
                        // .attr("cy", 0)
                        .attr("cx", function (d, i) { return (i * _itemOffsetX) - _itemRadius; })
                        .attr("cy", function (d, i) { return (i * _itemOffsetY) - _itemRadius; })
                        .style("fill", function (d) { return _scale(d); })
                        .style("stroke", "black");

                legendContainer.selectAll(".ggjs-legend-item-label")
                        .data(data)
                    .enter().append("text")
                        .attr("class", "ggjs-legend-item-label")
                        .attr("x", function (d, i) { return (i * _itemOffsetX) + _itemMarkerLabelGap; })
                        .attr("y", function (d, i) { return i * _itemOffsetY; })
                        .text(function (d) { return d; });

                // Add the label 'Legend' on enter
                // containerDiv.selectAll('b')
                //  .data([data])
                //  .enter().append('b')
                //  .text('Legend');
            });
        }

        // Accessor methods

        // Scale accessor
        legend.scale = function (value) {
            if (!arguments.length) { return _scale; }
            _scale = value;
            return legend;
        };

        // Y offset accessor
        legend.itemOffsetX = function (value) {
            if (!arguments.length) { return _itemOffsetX; }
            _itemOffsetX = value;
            return legend;
        };

        // Y offset accessor
        legend.itemOffsetY = function (value) {
            if (!arguments.length) { return _itemOffsetY; }
            _itemOffsetY = value;
            return legend;
        };

        // Radius accessor
        legend.itemRadius = function (value) {
            if (!arguments.length) { return _itemRadius; }
            _itemRadius = value;
            return legend;
        };

        return legend;
    }

    prototype.drawLegends = function () {
        // ToDo: find the legends for all aes across all layers

        // ToDo: combine aes if possible, like fill and shape
        // Find rules to combine legends - e.g. if same fields
        // are used for different aes, then legends can be combined.
        // E.g. if 'country' field is used for aes 'shape' and 'fill'
        // then draw a single legend for 'country' values adapting 
        // the fill and shape of the markers
        var plotDef = this.plotDef(),
            plot = this.plotSVG(),
            layerDefs = plotDef.layers().asArray(),
            legendX = 0,    // Cummalative legend offset 
            legendY = 0,    // Cummalative legend offset 
            itemOffsetX = 0,    // Horizontal gap between legend items
            itemOffsetY = 18,   // Vertical gap between legend items
            itemRadius = 5, // Radius of circle markers
            titleHeight = 12,   // Height of legend title
            i, j, layerDef, legendArea, legendBaseX, legendBaseY, 
            scaleNamesLookup = {},
            scaleNamesToDisplay = [],
            legendData, legend, aesmappings, aesmapping, aes, scaleName, scale;

        // ToDo: legend position
        switch ("top") {
            case "top":
                itemOffsetX = 100;
                itemOffsetY = 0;
                legendBaseX = Math.max(0, plotDef.plotAreaX() - itemOffsetY);
                legendArea = plot.append("g")
                    .attr("transform", "translate(" + legendBaseX + "," + plotDef.plotAreaY() + ")");
                break;
            // case "bottom":
            // case "left":
            // case "right": // Fall through to default for right
            default:
                itemOffsetX = 0;
                itemOffsetY = 18;
                legendBaseX = plotDef.plotAreaX() + (0.7 * plotDef.plotAreaWidth());
                legendArea = plot.append("g")
                    .attr("transform", "translate(" + legendBaseX + "," + plotDef.plotAreaY() + ")");
                break;
        }

        // Look for scales to turn into legends
        for (i = 0; i < layerDefs.length; i++) {
            layerDef = layerDefs[i];
            aesmappings = layerDef.aesmappings().asArray();

            // console.log("aesmappings", aesmappings)
            if (aesmappings) {
                for (j = 0; j < aesmappings.length; j++) {
                    aesmapping = aesmappings[j];
                    // console.log(aesmapping)
                    aes = aesmapping.aes();
                    // Skip aesthetics which are already display as axis
                    if (aes === "x" || aes === "y") {
                        continue;
                    }
                    scaleName = aesmapping.scaleName();
                    // console.log("aesmapping", aes, scaleName);
                    if (scaleName !== null && typeof scaleNamesLookup[scaleName] === 'undefined') {
                        scaleNamesToDisplay.push(scaleName);
                        scaleNamesLookup[scaleName] = true;
                    }
                }
            }
        }

        for (i = 0; i < scaleNamesToDisplay.length; i++) {
            // ToDo: check type of scale
            //   if ordinal: when setting up plot find the domain values
            //          then look them up here
            //   if quan: display box with range of values (gradient?)
            scaleName = scaleNamesToDisplay[i];
            scale = this.d3Scale(scaleName);
            legendData = scale.domain();
            // legendData = ["a", "b", "c"];
            // console.log("scale: ", scaleNamesToDisplay[i]);
            // find the scale
            // scale = d3.scale.category20();
            // scale.domain(legendData);

            var lgnd = scaleLegend()
                .itemOffsetX(itemOffsetX)
                .itemOffsetY(itemOffsetY)
                .itemRadius(itemRadius)
                .scale(scale);

            legend = legendArea.append("g")
                .attr("transform", "translate(0," + legendY + ")")
                .attr("class", "legend")
                .data([legendData])
                // .attr("transform","translate(50,30)")
                .style("font-size","12px")
                .call(lgnd);

            // Set up offsets for next legend collection
            legendY += titleHeight + legendData.length * itemOffsetY;
        }

    };


    // ----
    // Geo
    // ----

    // NOTE: this is old SVG attempt at renderering maps. Currently
    // using separate Leaflet renderer, but would be good to get
    // SVG maps working again to remove Leaflet dependency.
    prototype.setupGeo = function () {
        var this_ = this,
            plotDef = this.plotDef(),
            width = plotDef.plotAreaWidth(),
            height = plotDef.plotAreaHeight();

        if (plotDef.coord() !== "mercator") {
            return;
        }

        // var width = Math.max(960, window.innerWidth),
  //        height = Math.max(500, window.innerHeight);

        // Orig projection (compatible with tiles)
        // var projection = d3.geo.mercator()
        //     .scale((1 << 20) / 2 / Math.PI) // US
        //     // .scale((1 << 20) / 2 / Math.PI) // Lambeth
        //     .translate([width / 2, height / 2]);

        var projection = d3.geo.mercator()
            .center([0, 51])
            .scale(2000)
            .rotate([0, 0]);

        //var center = projection([-100, 40]);  // US
        //var center = projection([-106, 37.5]);    // US
        //var center = projection([-10, 55]);   // UK
        var scale0 = (width - 1) / 2 / Math.PI;
        var zoom = d3.behavior.zoom()
            .translate([width / 2, height / 2])
            .scale(scale0)
            .scaleExtent([scale0, 8 * scale0])
            .on("zoom", zoomed);

        var path = d3.geo.path()
            .projection(projection);

        // var center = projection([-0.1046, 51.46]);  // Lambeth

        // var zoom = d3.behavior.zoom()
        //     .scale(projection.scale() * 2 * Math.PI)
        //     .scaleExtent([1 << 11, 1 << 14])
        //     .translate([width - center[0], height - center[1]])
        //     .on("zoom", this_.drawLayers);

            //.on("zoom", this_.drawLayers(this_.renderer.plot));
            //.on("zoom", zoomed);

        this.geo.zoom = zoom;

        // With the center computed, now adjust the projection such that
        // it uses the zoom behavior’s translate and scale.
        // projection
        //     .scale(1 / 2 / Math.PI)
        //     .translate([0, 0]);

        this.geo.projection = projection;
        this.geo.path = path;

        // Share the svg group between geo layers so the same zoom
        // settings can be applied to all layers
        var plotElem = this.renderer.plot;

        plotElem.append("rect")
            .attr("class", "ggjs-geo-overlay")
            .attr("width", width)
            .attr("height", height);
        
        this.geo.svgGroup = plotElem.append("g");
        this.geo.zoomRedrawFunctions = [];
        var g = this.geo.svgGroup;

        function zoomed() {
            console.log("zoomed");
            console.log("projection", projection);
            // console.log("g", g);
            console.log("this_.geo.svgGroup", this_.geo.svgGroup);
            console.log("this_.geo", this_.geo);
            projection
                .translate(zoom.translate())
                .scale(zoom.scale());

            this_.geo.zoomRedrawFunctions.forEach(function (redrawFunction) {
                redrawFunction();
            });

            // g.selectAll("path")
            //     .attr("d", path);
        }

        plotElem
            .call(zoom)
            .call(zoom.event);
    };





    // ----------------
    // Layer renderers
    // ----------------

    prototype.drawMapTiles = function (plotArea, layerDef) {
        // Draws geographic map tiles images onto plot area
        console.log("Drawing map tiles");
        var plotDef = this.plotDef(),
            width = plotDef.plotAreaWidth(),
            height = plotDef.plotAreaHeight(),
            zoom = this.geo.zoom,
            projection = this.geo.projection,
            svgElem = this.geo.svgGroup;
            // plot = this.renderer.plot;

        //var width = Math.max(960, window.innerWidth),
        //  height = Math.max(500, window.innerHeight);
        var tau = 2 * Math.PI;

        var tile = d3.geo.tile()
            .scale(projection.scale() * tau)
            .translate(projection([0, 0]))
            .size([width, height]);

        var tiles = tile();

        svgElem.append("g").selectAll("image")
                .data(tiles)
            .enter().append("image")
                .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
                .attr("width", Math.round(tiles.scale))
                .attr("height", Math.round(tiles.scale))
                .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
                .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });

        // svgElem.append("g").selectAll("image")
        //         .data(tiles)
        //     .enter().append("image")
        //         .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/mapbox.natural-earth-2/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        //         .attr("width", Math.round(tiles.scale))
        //         .attr("height", Math.round(tiles.scale))
        //         .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
        //         .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });
        var mapTiles = svgElem.append("g");

        var zoomedRedraw = function () {
            // Function to redraw content when zoom/pan changes. See zoomed function
            // in renderer.
            var tile = d3.geo.tile()
                .scale(projection.scale() * tau)
                .translate(projection([0, 0]))
                .size([width, height]);

            var tiles = tile();
            
            console.log("GeoJSON zoomed.");
            // TODO: limit so only this layers images are redrawn
            svgElem.selectAll("image")
                .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
                .attr("width", Math.round(tiles.scale))
                .attr("height", Math.round(tiles.scale))
                .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
                .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });
            // mapTiles.selectAll("image")
            //         .data(tiles)
            //     .enter().append("image")
            //         .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/mapbox.natural-earth-2/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
            //         .attr("width", Math.round(tiles.scale))
            //         .attr("height", Math.round(tiles.scale))
            //         .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
            //         .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });
            // svgElem.selectAll("image")
            //     .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/mapbox.natural-earth-2/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
            //     .attr("width", Math.round(tiles.scale))
            //     .attr("height", Math.round(tiles.scale))
            //     .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
            //     .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });
        };

        this.geo.zoomRedrawFunctions.push(zoomedRedraw);

        // OLD VERSION BELOW
        /*
        var tile = d3.geo.tile()
            .size([width, height]);

        // var svg = d3.select("body").append("svg")
        //  .attr("width", width)
        //  .attr("height", height);
        var svg = plot;

        var raster = svg.append("g");

        function zoomed() {
            var tiles = tile
                .scale(zoom.scale())
                .translate(zoom.translate())
                ();

            var image = raster
                    // .attr("transform", "scale(" + projection.scale + ")translate(" + projection.translate + ")")
                    .attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
                .selectAll("image")
                    .data(tiles, function(d) { return d; });

            image.exit()
                .remove();

            image.enter().append("image")
                .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/examples.map-zr0njcqy/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
                .attr("class", "ggjs-tile")
                .attr("width", 1)
                .attr("height", 1)
                .attr("x", function(d) { return d[0]; })
                .attr("y", function(d) { return d[1]; });
        }
        zoomed();
        */
    };

    prototype.drawLineLayer = function (plotArea, layerDef) {
        // Draws lines onto the plot area. 
        // Lines are drawn in x axis order. See Path for drawing lines
        // in data order
        var plotDef = this.plotDef(),
            aesmappings = layerDef.aesmappings(),
            // fillAesMap = aesmappings.findByAes("fill"),
            xField = aesmappings.findByAes("x").field(),
            yField = aesmappings.findByAes("y").field(),
            xScale = this.xAxis().scale(),
            yScale = this.yAxis().scale(),
            datasetName = layerDef.data(),
            dataset = this.getDataset(datasetName),
            lines, values;

        // Take a copy of values as sorting will mutate the dataset (other layers
        //  might need data order preserved)
        values = ggjs.util.deepCopy(dataset.values());

        // ToDo: values need to be ordered by x axis before drawing (see Table 4.2
        //   in GGPlot2 book)
        ggjs.dataHelper.sortDatatable(values, xField);
        console.log("Values after sort");
        console.log(values);

        switch (plotDef.coord()) {
            case "cartesian":
                lines = this.drawCartesianLineLayer(plotArea, values, xField, yField, xScale, yScale);
                break;
            default:
                throw new Error("Don't know how to draw lines for co-ordinate system " + plotDef.coord());
        }

        // ToDo: apply line colour
        // this.applyFillColour(lines, aesmappings);
        
    };

    prototype.drawCartesianLineLayer = function (plotArea, values, xField, yField, xScale, yScale) {
        var line = d3.svg.line()
                    .x(function (d) { return xScale(d[xField]); })
                    .y(function (d) { return yScale(d[yField]); }),
            // ToDo: work out how to support line series (current values is
            //  put in an array to make the line function work). Needs to 
            //  work with series legend
            lines = plotArea.selectAll("path.ggjs-line")
                        .data([values])
                    .enter()
                        .append("path")
                        .attr("class", "ggjs-line")
                        .attr("d", line)
                        .style("fill", "none")
                        .style("stroke", "black")
                        .style("stroke-width", "1");
        return lines;
    };

    prototype.drawPathLayer = function (plotArea, layerDef) {
        var plotDef = this.plotDef();

        switch (plotDef.coord()) {
            case "mercator":
                this.drawMapPathLayer(plotArea, layerDef);
                break;
            default:
                throw new Error("Do not know how to draw path for coord " + plotDef.coord());
        }
    };

    prototype.drawMapPathLayer = function (plotArea, layerDef) {
        // Draws path on a map plot
        var plotDef = this.plotDef(),
            // width = plotDef.plotAreaWidth(),
            // height = plotDef.plotAreaHeight(),
            zoom = this.geo.zoom,
            projection = this.geo.projection,
            plot = this.plotSVG();
        console.log("drawing map path");
        var svg = plot;

        var path = d3.geo.path()
            .projection(projection);

        var vector = svg.append("path");
        var vector2 = svg.append("g")
            .attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
            //.style("stroke-width", 1 / zoom.scale());

        d3.json("data/us.json", function(error, us) {
            //svg.call(zoom);
            vector.attr("d", path(topojson.mesh(us, us.objects.counties)))
                .attr("class", "ggjs-path-map");

            aa = [-122.490402, 37.786453];
            bb = [-122.389809, 37.72728];
            vector2.selectAll("circle")
                .data([aa,bb])
                .enter().append("circle")
                    // .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
                    // .attr("cy", function (d) { return projection(d)[1]; })
                    .attr("transform", function(d) {return "translate(" + projection(d) + ")";})
                    .attr("r", 5 / zoom.scale())
                    .attr("fill", "red");
            //zoomed();

            vector
            .attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
            .style("stroke-width", 1 / zoom.scale());
            // vector2
            //  .attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
            //  .style("stroke-width", 1 / zoom.scale());
        });


    };

    prototype.drawPointLayer = function (plotArea, layerDef) {
        var plotDef = this.plotDef(),
            aesmappings = layerDef.aesmappings(),
            xField = aesmappings.findByAes("x").field(),
            yField = aesmappings.findByAes("y").field(),
            xScale = this.xAxis().scale(),
            yScale = this.yAxis().scale(),
            datasetName = layerDef.data(),
            dataset = this.getDataset(datasetName),
            //dataset = plotDef.data().dataset(datasetName),
            values = dataset.values();
        
        switch (plotDef.coord()) {
            case "cartesian":
                this.drawCartesianPointLayer(plotArea, values, aesmappings, xField, yField, xScale, yScale);
                break;
            case "mercator":
                this.drawMapPointLayer(plotArea, values, aesmappings, xField, yField, xScale, yScale);
                break;
            default:
                throw new Error("Do not know how to draw point for coord " + plotDef.coord());
        }
    };

    // Draws points (e.g. circles) onto the plot area
    prototype.drawCartesianPointLayer = function (plotArea, values, aesmappings, xField, yField, xScale, yScale) {
        var xScaleType = this.xAxisScaleDef().type(),
            xOffset = xScaleType === 'ordinal' ? Math.ceil(xScale.rangeBand() / 2) : 0,
            points;
        
        points = plotArea.selectAll(".ggjs-point")
                .data(values)
            .enter().append("circle")
                .attr("class", "ggjs-point")
                .attr("r", 3.5)
                .attr("cx", function (d) { return xScale(d[xField]) + xOffset; })
                .attr("cy", function (d) { return yScale(d[yField]); });

        this.applyFillColour(points, aesmappings);
    };

    prototype.drawMapPointLayer = function (plotArea, values, aesmappings, xField, yField, xScale, yScale) {
        // Draws points (e.g. circles) onto the plot area
        var projection = this.geo.projection,
            zoom = this.geo.zoom,
            plot = this.plotSVG(),
            dataAttrXField = this.dataAttrXField,
            dataAttrXValue = this.dataAttrXValue,
            dataAttrYField = this.dataAttrYField,
            dataAttrYValue = this.dataAttrYValue,
            svg = plot;
        
        // var points = plotArea.selectAll(".ggjs-point")
        //      .data(values)
        //  .enter().append("circle")
        //      .attr("class", "ggjs-point")
        //      .attr("r", 3.5)
        //      .attr("cx", function (d) { return xScale(d[xField]); })
        //      .attr("cy", function (d) { return yScale(d[yField]); });
        // console.log(values[0][xField])
        // console.log(values[0][yField])
        // console.log( projection([ +(values[0][yField]), +(values[0][xField]) ]) )

        // var points = plotArea.selectAll(".pin")
        //      .data(values)
        //  .enter().append("circle", ".pin")
        //      .attr("r", 5)
        //      .attr("transform", function(d) {
        //          return "translate(" + projection([
        //            d[yField],
        //            d[xField]
        //          ]) + ")"; });

        var vector2 = svg.append("g");
            //.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
            //.style("stroke-width", 1 / zoom.scale());

        vector2.selectAll("circle")
            .data(values)
            .enter().append("circle")
                // .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
                // .attr("cy", function (d) { return projection(d)[1]; })
                .attr("transform", function(d) {return "translate(" + projection([ +d[yField], +d[xField] ]) + ")";})
                .attr("r", 5)// / zoom.scale())
                .attr("fill", "rgba(255,0,0,0.6)")
                .attr(dataAttrXField, xField)
                .attr(dataAttrXValue, function (d) { return d[xField]; })
                .attr(dataAttrYField, yField)
                .attr(dataAttrYValue, function (d) { return d[yField]; });


        /*
        ORIG Version - working with old zoomed tiles
        var vector2 = svg.append("g")
            .attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
            //.style("stroke-width", 1 / zoom.scale());

        vector2.selectAll("circle")
            .data(values)
            .enter().append("circle")
                // .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
                // .attr("cy", function (d) { return projection(d)[1]; })
                .attr("transform", function(d) {return "translate(" + projection([ +d[yField], +d[xField] ]) + ")";})
                .attr("r", 5 / zoom.scale())
                .attr("fill", "rgba(255,0,0,0.6)")
                .attr(dataAttrXField, xField)
                .attr(dataAttrXValue, function (d) { return d[xField]; })
                .attr(dataAttrYField, yField)
                .attr(dataAttrYValue, function (d) { return d[yField]; });
        */

        // var coordinates = projection([mylon, mylat]);
        // plotArea.selectAll(".circle")
        //      .data(values)
        //  .enter().append('circle', ".circle")
        //      .attr('cx', function (d) { return projection([ +d[yField], +d[xField] ])[0]; } )
        //      .attr('cy', function (d) { return projection([ +d[yField], +d[xField] ])[1]; } )
        //      .attr('r', 5);

        //this.applyFillColour(points, aesmappings);
    };

    prototype.drawTextLayer = function (plotArea, layerDef) {
        // Draws text onto the plot area
        // Similar to point layer rendering
        var plotDef = this.plotDef(),
            aesmappings = layerDef.aesmappings(),
            xAes = aesmappings.findByAes("x"),
            yAes = aesmappings.findByAes("y"),
            labelAes = aesmappings.findByAes("label"),
            xScale = this.xAxis().scale(),
            yScale = this.yAxis().scale(),
            datasetName = layerDef.data(),
            dataset = this.getDataset(datasetName),
            //dataset = plotDef.data().dataset(datasetName),
            values = dataset.values(),
            xField, yField, labelField,
            points;

        if (xAes === null) throw new Error("Cannot draw text layer, x aesthetic no specified");
        if (yAes === null) throw new Error("Cannot draw text layer, y aesthetic no specified");

        xField = xAes.field();
        yField = yAes.field();
        labelField = labelAes === null ? null : labelAes.field();
        if (labelField === null) {
            this.warning("No text field supplied for text layer, label will be blank.");
        }

        points = plotArea.selectAll("text.ggjs-label")
                .data(values)
            .enter().append("text")
                .attr("class", "ggjs-label")
                .attr("x", function (d) { return xScale(d[xField]); })
                .attr("y", function (d) { return yScale(d[yField]); })
                .text(function (d) { 
                    if (labelField !== null) {
                        return d[labelField];
                    } else {
                        return "";
                    }
                });

        //this.applyFillColour(points, aesmappings);
    };

    prototype.drawBarLayer = function (plotArea, layerDef) {
        // Draws bars onto the plot area
        var plotDef = this.plotDef(),
            yAxisHeight = plotDef.yAxisHeight(),
            aesmappings = layerDef.aesmappings(),
            fillAesMap = aesmappings.findByAes("fill"),
            xField = aesmappings.findByAes("x").field(),
            yField = aesmappings.findByAes("y").field(),
            xScale = this.xAxis().scale(),
            yScale = this.yAxis().scale(),
            datasetName = layerDef.data(),
            //dataset = plotDef.data().dataset(datasetName),
            dataset = this.getDataset(datasetName),
            isStacked = layerDef.useStackedData(),
            bars, values;

        // if (dataset == null) {
        //  // Use default dataset for the plot
        //  var datasetNames = plotDef.data().names();
        //  if (datasetNames.length !== 1) {
        //      throw "Expected one DataSet in the Plot to use as the default DataSet";
        //  }
        //  datasetName = datasetNames[0];
        //  dataset = plotDef.data().dataset(datasetName);

        //  if (dataset == null) {
        //      throw "Couldn't find a layer DataSet or a default DataSet.";
        //  }
        // }

        values = dataset.values();

        // Stacked/dodged bar charts
        // ToDo: dodge bar charts
        if (isStacked) {
            // Work out new baseline for each x value
            var fillScaleDef = this.scaleDef(fillAesMap.scaleName());
            if (fillScaleDef === null) {
                throw new Error("No scale could be found for fill scale " + fillAesMap.scaleName());
            }

            if (this.xAxisScaleDef().isOrdinal() && fillScaleDef.isOrdinal()) {
                values = ggjs.dataHelper.generateStackYValues(values, xField, fillAesMap.field(), yField);
            } else {
                throw new Error("Do not know how to draw stacked/dodged bars with non ordinal scales.");
            }
        }

        switch (plotDef.coord()) {
            case "cartesian":
                bars = this.drawCartesianBars(plotArea, values, xField, yField, xScale, yScale, yAxisHeight, isStacked);
                break;
            case "polar":
                bars = this.drawPolarBars(plotArea, values, xField, yField, xScale, yScale, yAxisHeight, isStacked);
                break;
            default:
                throw new Error("Don't know how to draw bars for co-ordinate system " + plotDef.coord());
        }
        this.applyFillColour(bars, aesmappings);
        
    };

    prototype.drawCartesianBars = function (plotArea, values, xField, yField, xScale, yScale, yAxisHeight, isStacked) {
        console.log("Drawing cart bars");
        var dataAttrXField = this.dataAttrXField,
            dataAttrXValue = this.dataAttrXValue,
            dataAttrYField = this.dataAttrYField,
            dataAttrYValue = this.dataAttrYValue,
            bars = plotArea.selectAll("rect.ggjs-bar")
                .data(values)
            .enter().append("rect")
                .attr("class", "ggjs-bar")
                .attr("x", function(d) { return xScale(d[xField]); })
                .attr("y", function(d) { 
                    if (isStacked) {
                        return yScale(d[yField] + d.__y0__); 
                    } else {
                        return yScale(d[yField]); 
                    }
                })
                .attr("height", function(d) { return yAxisHeight - yScale(d[yField]); })
                .attr("width", xScale.rangeBand())
                .attr(dataAttrXField, xField)
                .attr(dataAttrXValue, function (d) { return d[xField]; })
                .attr(dataAttrYField, yField)
                .attr(dataAttrYValue, function (d) { return d[yField]; });
        console.log("End Drawing cart bars");
        return bars;
    };

    prototype.drawPolarBars = function (plotArea, values, xField, yField, xScale, yScale, yAxisHeight, isStacked) {
        var arc, bars;

        arc = d3.svg.arc()
            .innerRadius(0)
            //.outerRadius(150)
            .outerRadius(function (d) {return yAxisHeight - yScale(d[yField]); })
            .startAngle(function (d) { console.log("startAngle d: " + d[xField]); console.log("startAngle: " + xScale(d[xField])); return xScale(d[xField]); })
            .endAngle(function (d) { console.log("endAngle d: " + d[xField]); console.log("endAngle: " + xScale(d[xField]) + xScale.rangeBand()); return xScale(d[xField]) + xScale.rangeBand(); });

        bars = plotArea.selectAll("path.ggjs-arc")
                .data(values)
            .enter().append("path")
                .attr("class", "ggjs-arc")
                .attr("d", arc);
        return bars;
    };

    prototype.drawGeoJSONLayer = function (plotArea, layerDef) {
        // Draws GeoJSON layer onto the plot area
        var plotDef = this.plotDef(),
            aesmappings = layerDef.aesmappings(),
            fillAesMap = aesmappings.findByAes("fill"),
            xField = aesmappings.findByAes("x").field(),
            yField = aesmappings.findByAes("y").field(),
            xScale = this.xAxis().scale(),
            yScale = this.yAxis().scale(),
            datasetName = layerDef.data(),
            dataset = this.getDataset(datasetName),
            projection = this.geo.projection,
            zoom = this.geo.zoom,
            geoElem = this.geo.svgGroup,
            path = this.geo.path,
            // plot = this.renderer.plot,
            output, values;

        values = dataset.values();

        switch (plotDef.coord()) {
            case "mercator":
                // bars = this.drawCartesianBars(plotArea, values, xField, yField, xScale, yScale, yAxisHeight, isStacked);
                output = ggjs.geomGeoJSON.drawGeoJSONLayer(geoElem, values, aesmappings, 
                    xField, yField, 
                    xScale, yScale,
                    projection, path, zoom);
                this.geo.zoomRedrawFunctions.push(output);
                break;
            default:
                throw new Error("Don't know how to draw GeoJSON for co-ordinate system " + plotDef.coord());
        }

        // this.applyFillColour(bars, aesmappings);
        
    };

    return svgRenderer;
}(d3, ggjs.layerRendererPlugins));
// Leaflet map renderer
ggjs.LeafletRenderer = (function (d3, layerRendererPlugins, L) {
    var leafletRenderer = function (selector, plotDef) {
        this._plotDef = plotDef;
        var width = plotDef.width(),
            height = plotDef.height(),
            parentWidth, elem, mapElem;

        if (typeof width === 'undefined' || width === null) {
            // Set width to parent container width
            try {
                parentWidth = d3.select(selector).node().offsetWidth;
                // parentWidth = d3.select(plotDef.selector()).node().offsetWidth;
            } catch (err) {
                throw new Error("Couldn't find the width of the parent element."); 
            }
            if (typeof parentWidth === 'undefined' || parentWidth === null) {
                throw new Error("Couldn't find the width of the parent element.");
            }
            this._plotDef.width(parentWidth);
        }

        if (typeof height === 'undefined' || height === null) {
            this._plotDef.height(500);
        }

        // Set height/width of div (needed for Leaflet)
        elem = d3.select(selector);
        // elem = d3.select(plotDef.selector());
        mapElem = elem.append("div")
            .style("height", this._plotDef.height() + "px")
            .style("width", this._plotDef.width() + "px");

        this._map = new L.Map(mapElem.node(), {center: [37.8, -96.9], zoom: 4}); // US
    };

    // var prototype = ggjs.util.extend(leafletRenderer.prototype, ggjs.D3RendererBase.prototype);
    var prototype = leafletRenderer.prototype;

    prototype.plotDef = function (val) {
        if (!arguments.length) return this._plotDef;
        this._plotDef = val;
        return this;
    };

    prototype.rendererType = function () {
        return "leaflet";
    };

    prototype.remove = function () {
    };

    prototype.buildScales = function () {
    };

    prototype.setupXAxis = function () {
    };

    prototype.setupYAxis = function () {
    };

    prototype.drawAxes = function () {
    };

    prototype.drawLayers = function () {
        // TODO: let parent renderer calling draw layers?
        var plotDef = this.plotDef(),
            coords = plotDef.coord(),
            // plot = this.renderer.plot,
            map = this._map,
            layerDefs = plotDef.layers().asArray(),
            i, layerDef, plotArea, layerRenderer, layerRendererConstr, geom;

        // Draw each layer
        for (i = 0; i < layerDefs.length; i++) {
            layerDef = layerDefs[i];

            var datasetName = layerDef.data(),
                dataset = this.getDataset(datasetName),
                values = dataset.values();

            geom = layerDef.geom().geomType();
            layerRendererConstr = layerRendererPlugins.getLayerRenderer(this.rendererType(), coords, geom);
            if (layerRendererConstr === null) {
                throw new Error("Couldn't find layer renderer for " + this.rendererType() + 
                    ", " + coords + ", " + geom);
            }

            // var plotSettings = {getDataset: this.getDataset};
            var plotSettings = this;
            layerRenderer = new layerRendererConstr(plotSettings, layerDef);

            layerRenderer.onAdd(map);

            /*

            switch (layerDef.geom().geomType()) {
                case "GeomPoint":
                    this.drawPointLayer(plotArea, layerDef);
                    break;
                case "GeomBar":
                    this.drawBarLayer(plotArea, layerDef);
                    break;
                case "GeomText":
                    this.drawTextLayer(plotArea, layerDef);
                    break;
                case "GeomLine":
                    this.drawLineLayer(plotArea, layerDef);
                    break;
                case "GeomPath":
                    this.drawPathLayer(plotArea, layerDef);
                    break;
                case "GeomGeoTiles":
                    this.drawMapTiles(plotArea, layerDef);
                    break;
                case "GeomGeoJSON":
                    this.drawGeoJSONLayer(plotArea, layerDef);
                    break;
                default:
                    throw new Error("Cannot draw layer, geom type not supported: " + layerDef.geom().geomType());
            }
            */
        }
    };

    prototype.drawLegends = function () {
    };

    // TODO: This is copied from orig renderer. Put in base class?
    prototype.getDataset = function (datasetName) {
        var plotDef = this.plotDef(),
            dataset = plotDef.data().dataset(datasetName),
            datasetNames;
        if (dataset === null || typeof dataset === "undefined") {
            // Use default dataset for the plot
            datasetNames = plotDef.data().names();
            if (datasetNames.length !== 1) {
                throw new Error("Expected one DataSet in the Plot to use as the default DataSet");
            }
            datasetName = datasetNames[0];
            dataset = plotDef.data().dataset(datasetName);

            if (dataset === null) {
                throw new Error("Couldn't find a layer DataSet or a default DataSet.");
            }
        }
        return dataset;
    };

    return leafletRenderer;
}(d3, ggjs.layerRendererPlugins, L));


ggjs.Renderer = (function (d3) {
    var renderer = function (selector, plotDef) {
        this.renderer = {
            selector: selector,
            plotDef: plotDef,
            plot: null, // The element to draw to
            xAxis: null,
            yAxis: null,
            scaleNameToD3Scale: {}, // Lookup to find D3 scale for scale name
            datasetsRetrieved: {},
            warnings: [],
            defaultFillColor: "rgb(31, 119, 180)"
        };
        
    };

    var prototype = renderer.prototype;

    // ----------
    // Accessors
    // ----------

    prototype.plotDef = function (val) {
        if (!arguments.length) return this.renderer.plotDef;
        this.renderer.plotDef = val;
        return this;
    };

    prototype.selector = function (val) {
        if (!arguments.length) return this.renderer.selector;
        this.renderer.selector = val;
        return this;
    };

    prototype.warnings = function (val) {
        if (!arguments.length) return this.renderer.warnings;
        this.renderer.warnings = val;
        return this;
    };

    // End Accessors

    prototype.warning = function (warning) {
        // Adds a warning to the log
        this.renderer.warnings.push(warning);
    };

    prototype.render = function () {
        var this_ = this;
        // Clear contents (so they disapper in the event of failed data load)
        console.log("TODO: switch content remove to new renderer");
        d3.select(this.selector()).select("svg").remove();
        // d3.select(this.plotDef().selector()).select("svg").remove();
        // Fetch data then render plot
        this.fetchData(function () { this_.renderPlot(); });
    };

    prototype.fetchData = function (finishedCallback) {
        var plotDef = this.plotDef(),
            datasetNames = plotDef.data().names(),
            loadData = function (url, datasetName, contentType, callback) {
                var contentTypeLC = contentType ? contentType.toLowerCase() : contentType,
                    dataset = plotDef.data().dataset(datasetName);
                switch (contentTypeLC) {
                    case "text/csv":
                        d3.csv(url, function(err, res) {
                            if (err) throw new Error("Error fetching CSV results: " + err.statusText);
                            dataset.values(res);
                            dataset.applyDataTypes();
                            callback(null, res);
                        });
                        break;
                    case "text/tsv":
                    case "text/tab-separated-values":
                        d3.tsv(url, function(err, res) {
                            if (err) throw new Error("Error fetching TSV results: " + err.statusText);
                            dataset.values(res);
                            dataset.applyDataTypes();
                            callback(null, res);
                        });
                        break;
                    case "application/json":
                        d3.json(url, function(err, res) {
                            if (err) throw new Error("Error fetching JSON results: " + err.statusText);
                            dataset.values(res);
                            dataset.applyDataTypes();
                            callback(null, res);
                        });
                        break;
                    case "application/vnd.geo+json":
                        d3.json(url, function(err, res) {
                            if (err) throw new Error("Error fetching GEO JSON results: " + err.statusText);
                            dataset.values(res);
                            callback(null, res);
                        });
                        break;
                    default:
                        throw new Error("Don't know you to load data of type " + contentType);
                }
            },
            q = queue(3),
            i, datasetName, dataset;

        // Queue all data held at url
        for (i = 0; i < datasetNames.length; i++) {
            datasetName = datasetNames[i];
            dataset = plotDef.data().dataset(datasetName);
            if (dataset && dataset.url()) {
                q.defer(loadData, dataset.url(), datasetName, dataset.contentType());
            }
        }
        q.awaitAll(function(error, results) {
                if (error) {
                    // ToDo: write error in place of chart?
                    throw new Error("Error fetching data results: " + error.statusText);
                }
                // Data loaded - continue rendering
                finishedCallback();
            });
    };

    prototype.renderPlot = function () {
        var plotDef = this.plotDef(),
            selector = this.selector(),
            renderer,
            plot;

        if (plotDef.coord() === "mercator") {
            renderer = new ggjs.LeafletRenderer(selector, plotDef);
        } else {
            renderer = new ggjs.SVGRenderer(selector, plotDef);
        }

        renderer.buildScales();
        renderer.setupXAxis();
        renderer.setupYAxis();
        // TODO: merge setupGeo into constructor of SVGRenderer
        // renderer.setupGeo();
        renderer.drawAxes();
        renderer.drawLayers();
        renderer.drawLegends();
    };

    return renderer;
})(d3);

ggjs.renderer = function (selector, spec) {
    var plotDef = ggjs.plot(spec);
    return new ggjs.Renderer(selector, plotDef);
};
ggjs.dataHelper = (function (d3) {
    var datatableMin = function (datatable, field) {
            // Finds the min value of the field in the datatable
            return d3.min(datatable, function (d) { return d[field]; });
        },
        datatableMax = function (datatable, field) {
            // Finds the max value of the field in the datatable
            return d3.max(datatable, function (d) { return d[field]; });
        },
        datatableSum = function (datatable, field) {
            // Finds the sum of values for the field in the datatable
            return d3.sum(datatable, function (d) { return d[field]; });
        },
        datatableStat = function (datatable, field, stat) {
            // Finds the value of the stat (e.g. max) for the field in the datatable
            var statVal = null;
            switch (stat) {
                case "min":
                case "max":
                    statVal = stat === "min" ? datatableMin(datatable, field) : datatableMax(datatable, field);
                    break;
                case "sum":
                    statVal = datatableSum(datatable, field);
                    break;
                default:
                    throw new Error("Can't get datatables stat, unknown stat " + stat);
            }
            return statVal;
        },
        datatablesStat = function (datatables, field, stat) {
            var statVal = null,
                i, tmpStat;

            switch (stat) {
                case "min":
                case "max":
                    for (i = 0; i < datatables.length; i++) {
                        tmpStat = stat === "min" ? datatableMin(datatables[i], field) : datatableMax(datatables[i], field);
                        if (!isNaN(tmpStat)) {
                            if (statVal === null) statVal = tmpStat;
                            statVal = stat === "min" ? Math.min(statVal, tmpStat) : Math.max(statVal, tmpStat);
                        }
                    }
                    break;
                default:
                    throw new Error("Can't get datatables stat, unknown stat " + stat);
            }

            return statVal;
        },
        generateStackYValues = function (data, groupField, stackField, valueField) {
            // Adds an extra y value called __y0__ to the data
            // which gives the y value of the previous record within
            // the stacked items of the group.
            // Useful for stacked bar charts where an extra y value is
            // needed to know where the last bar in the group was placed.
            var dataCopy = ggjs.util.deepCopy(data),
                nested = d3.nest()
                    .key(function (d) { return d[groupField]; })
                    .key(function (d) { return d[stackField]; })
                    .entries(dataCopy),
                groupKeys, stackKeys, values,
                i, j, k, prevValue;

            for (i = 0; i < nested.length; i++) {
                // Group 1 level
                prevValue = 0;
                groupKeys = nested[i];
                for (j = 0; j < groupKeys.values.length; j++) {
                    // Group 2 level
                    stackKeys = groupKeys.values[j];
                    for (k = 0; k < stackKeys.values.length; k++) {
                        // Values level
                        values = stackKeys.values[k];
                        values.__y0__ = prevValue;
                        prevValue += values[valueField];
                    }
                }
            }

            return dataCopy;
        },
        maxStackValue = function (data, groupField, stackField, valueField) {
            // Finds the max value by summing stacked items within a group,
            // then find the max across groups.
            // For example it finds the max height of all the layers bars in
            // a stacked bar chart.
            var nested_data, max;

            // Get sum of each stack grouping
            nested_data = d3.nest()
                .key(function(d) { return d[groupField]; })
                //.key(function(d) { return d[stackField]; })
                .rollup(function(leaves) { 
                    return {
                        "stack_sum": d3.sum(leaves, function(d) {
                            return d[valueField];
                        })};
                })
                .entries(data);

            // Find max value across stack groupings
            max = d3.max(nested_data, function (d) { return d.values.stack_sum; });

            return max;
        },
        sortDatatable = function (datatable, field) {
            // Sorts the datatable rows according to the supplied field
            // Mutates the datatable
            datatable.sort(function (a, b) {
                if (a[field] > b[field]) {
                    return 1;
                }
                if (a[field] < b[field]) {
                    return -1;
                }
                return 0;
            });
            return datatable;
        };

    return {
        datatableMin: datatableMin,
        datatableMax: datatableMax,
        datatableSum: datatableSum,
        datatableStat: datatableStat,
        datatablesStat: datatablesStat,
        generateStackYValues: generateStackYValues,
        maxStackValue: maxStackValue,
        sortDatatable: sortDatatable
    };
})(d3);


ggjs.ggjs = (function () {
    // Init
    var render = function (spec) {
        // Load spec
        var plotDef = ggjs.plot(spec);

        // Render chart
        ggjs.renderer(plotDef).render();
    };

    return {
        render: render
    };
})();

    return ggjs;
});
