var ggjs = ggjs || {};

// ------------------
// Utilities
// ------------------

ggjs.util = (function () {
	var isUndefined = function (val) {
			return typeof val === 'undefined';
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
		deepCopy = function (obj) {
			return JSON.parse(JSON.stringify(obj));
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
		objKeys: objKeys,
		countObjKeys: countObjKeys,
		deepCopy: deepCopy,
		toBoolean: toBoolean
	}
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
    }
})();


// ------------------
// Datasets
// ------------------

ggjs.Dataset = (function() {
	var dataset = function(spec) {
		spec = spec || {};
		if (ggjs.util.isUndefined(spec.name)) throw "The dataset name must be defined";
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
				default:
					throw "Can't apply data type, unrecognised data type " + dataType;
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
		if (arguments.length < 1) throw "dataset function needs datasetName argument.";
		if (arguments.length == 1) return this.datasets[datasetName];
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


// ------------------
// Axes
// ------------------

ggjs.Axis = (function() {
	var axis = function(spec) {
		spec = spec || {};
		if (ggjs.util.isUndefined(spec.type)) throw "The axis type must be defined";
		this.axis = {
			type: spec.type,
			scale: spec.scale || null
		};
		//if (s) ggjs.extend(this.axis, s);
	};

	var prototype = axis.prototype;

	prototype.type = function (val) {
		if (!arguments.length) return this.axis.type;
		this.axis.type = val;
		return this;
	};

	prototype.scale = function(val) {
		if (!arguments.length) return this.axis.scale;
		// ToDo: set as object, ggjs scale (or either)?
		this.axis.scale = val;
		return this;
	};

	return axis;
})();

ggjs.axis = function(s) {
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
		if (arguments.length < 1) throw "axis function needs axisType argument.";
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

ggjs.axes = function(s) {
  return new ggjs.Axes(s);
};


// ------------------
// Scales
// ------------------

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
		return this.domain() != null;
	}

	prototype.hasRange = function () {
		// Whether a range is specified for the scale
		// Read only
		return this.range() != null;
	}

	prototype.isQuantitative = function () {
		var quantScales = ["linear", "sqrt", "pow", "log"];
		return ggjs.util.array.contains(quantScales, this.type());
	}

	prototype.isOrdinal = function () {
		var ordinalScales = ["ordinal", "category10", "category20", "category20b", "category20c"];
		return ggjs.util.array.contains(ordinalScales, this.type());
	}

	prototype.isTime = function () {
		var timeScales = ["time"];
		return ggjs.util.array.contains(timeScales, this.type());
	}

	return scale;
})();

ggjs.scale = function(s) {
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
		if (arguments.length < 1) throw "scale function needs scaleName argument.";
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

ggjs.scales = function(s) {
  return new ggjs.Scales(s);
};


// ------------------
// Padding
// ------------------

ggjs.Padding = (function () {
	var padding = function(s) {
		this.padding = {
			left: s.left || 20,
			right: s.right || 20,
			top: s.top || 20,
			bottom: s.bottom || 20
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

ggjs.padding = function(s) {
	return new ggjs.Padding(s);
};



// ------------------
// Aesthetic mappings
// ------------------

ggjs.AesMapping = (function () {
	// Aesthetic mapping shows which variables are mapped to which
	// aesthetics. For example, we might map weight to x position, 
	// height to y position, and age to size. 
	// 
	// GGPlot:
	// 		layer(aes(x = x, y = y, color = z))
	// Ref [lg] 3.1.1
	var aesmap = function(s) {
		this.aesmap = {
			aes: s.aes || null,
			field: s.field || null,
			scale: s.scale || null
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

	prototype.scale = function (val) {
		if (!arguments.length) return this.aesmap.scale;
		this.aesmap.scale = val;
		return this;
	};

	return aesmap;
})();

ggjs.aesmapping = function(s) {
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

ggjs.aesmappings = function(s) {
  return new ggjs.AesMappings(s);
};


// ------------------
// Layers
// ------------------

ggjs.Layer = (function () {
	// Layers are responsible for creating the objects that we perceive on the plot. 
	// A layer is composed of:
	//  - data and aesthetic mapping,
	//  - a statistical transformation (stat),
	//  - a geometric object (geom), and
	//  - a position adjustment
	// 
	// GGPlot:
	// 		layer(aes(x = x, y = y, color = z), geom="line",
	// 		stat="smooth")
	// Ref [lg] 3.1
	var layer = function(spec) {
		var fillAesMap, xAesMap;
		this.layer = {
			data: spec.data || null,
			geom: spec.geom || null,
			position: spec.position || null,
			aesmappings: ggjs.aesmappings(spec.aesmappings || [])
		};
		//if (s) ggjs.extend(this.layer, s);

		fillAesMap = this.layer.aesmappings.findByAes("fill");
		xAesMap = this.layer.aesmappings.findByAes("x");

		// Set defaults
		if (this.geom() === "bar" && this.position() === "stack" &&
			fillAesMap != null && xAesMap != null && 
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
	// 	if (this.geom() === "bar" && this.position() === "stack") {
	// 		return true;
	// 	}
	// 	return false;
	// }

	return layer;
})();

ggjs.layer = function(s) {
  return new ggjs.Layer(s);
};

ggjs.Layers = (function () {
	var layers = function(spec) {
		var i;
		this.layers = [];
		for (i = 0; i < spec.length; i++) {
			this.layers.push(ggjs.layer(spec[i]));
		}
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


// ------------------
// Plot
// ------------------

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
			width: spec.width || 500,
			height: spec.height || 500,
			padding: ggjs.padding(spec.padding || {}),
			data: ggjs.datasets(spec.data || []),
			defaultDatasetName: null,
			// ToDo: automatically find co-ordinate system based on layers?
			coord: spec.coord || "cartesian",
			scales: ggjs.scales(spec.scales|| []),
			axes: ggjs.axes(spec.axes || []),
			facet: spec.facet || null,
			layers: ggjs.layers(spec.layers || [])
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
				throw "Can't get y axis height, unknown co-ordinate system " + this.coord(); 
		}
	};

	// ----------------------
	// Data information
	// ----------------------

	prototype.defaultDatasetName = function (val) {
		if (!arguments.length) {
			if (this.plot.defaultDatasetName != null) {
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
	}

	return plot;
})();

ggjs.plot = function(p) {
  return new ggjs.Plot(p);
};

ggjs.Renderer = (function (d3) {
	var renderer = function(plotDef) {
		this.renderer = {
			plotDef: plotDef,
			xAxis: null,
			yAxis: null,
			datasetsRetrieved: {},
			warnings: []
		};
	};

	var prototype = renderer.prototype;

	prototype.plotDef = function (val) {
		if (!arguments.length) return this.renderer.plotDef;
		this.renderer.plotDef = val;
		return this;
	};

	prototype.warning = function (warning) {
		// Adds a warning to the log
		this.renderer.warnings.push(warning);
	}

	prototype.warnings = function (val) {
		if (!arguments.length) return this.renderer.warnings;
		this.renderer.warnings = val;
		return this;
	};

	prototype.render = function () {
		var this_ = this;
		d3.select(this.plotDef().selector()).select("svg").remove();
		// Fetch data then render plot
		this.fetchData(function () { this_.renderPlot(); })
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
							if (err) throw "Error fetching CSV results: " + err.statusText;
							dataset.values(res);
							dataset.applyDataTypes();
							callback(null, res);
						});
						break;
					case "text/tsv":
					case "text/tab-separated-values":
						d3.tsv(url, function(err, res) {
							if (err) throw "Error fetching TSV results: " + err.statusText;
							dataset.values(res);
							dataset.applyDataTypes();
							callback(null, res);
						});
						break;
					case "application/json":
						d3.json(url, function(err, res) {
							if (err) throw "Error fetching JSON results: " + err.statusText;
							dataset.values(res);
							dataset.applyDataTypes();
							callback(null, res);
						});
						break;
					default:
						throw "Don't know you to load data of type " + contentType;
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
					throw "Error fetching data results: " + error.statusText;
				}
				// Data loaded - continue rendering
				finishedCallback();
			});
	}

	prototype.renderPlot = function () {
		var plotDef = this.plotDef(),
			plot = d3.select(plotDef.selector())
				.append("svg")
					.attr("width", plotDef.width())
					.attr("height", plotDef.height());

		console.log(plotDef.plotAreaX());
		console.log(plotDef.plotAreaY());
		console.log(plotDef.plotAreaHeight());
		console.log(plotDef.plotAreaWidth());

		// ToDo: if no domain set on axes, default to extent
		// of data for appropriate aes across layers
		this.setupXAxis();
		this.setupYAxis();

		this.drawAxes(plot);
		this.drawLayers(plot);
		
	};

	prototype.drawLayers = function (plot) {
		var plotDef = this.plotDef(),
			layerDefs = plotDef.layers().asArray(),
			i, layerDef, plotArea;

		switch (plotDef.coord()) {
			case "cartesian":
				plotArea = plot.append("g")
					.attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaY() + ")");
				break;
			case "polar":
				plotArea = plot.append("g")
					.attr("transform", "translate(" + (plotDef.plotAreaX() + Math.floor(plotDef.plotAreaWidth() / 2)) + "," + (plotDef.plotAreaY() + Math.floor(plotDef.plotAreaHeight() / 2)) + ")");
				break;
		}
		//plotArea = plot.append("g")
		//	.attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaY() + ")");

		for (i = 0; i < layerDefs.length; i++) {
			layerDef = layerDefs[i];

			switch (layerDef.geom()) {
				case "point":
					this.drawPointLayer(plotArea, layerDef);
					break;
				case "bar":
					this.drawBarLayer(plotArea, layerDef);
					break;
				case "text":
					this.drawTextLayer(plotArea, layerDef);
					break;
				default:
					throw "Cannot draw layer, geom type not supported: " + layerDef.geom();
			}
		}
	};

	prototype.drawPointLayer = function (plotArea, layerDef) {
		// Draws points (e.g. circles) onto the plot area
		var plotDef = this.plotDef(),
			aesmappings = layerDef.aesmappings(),
			xField = aesmappings.findByAes("x").field(),
			yField = aesmappings.findByAes("y").field(),
			xScale = this.xAxis().scale(),
			yScale = this.yAxis().scale(),
			datasetName = layerDef.data(),
			dataset = plotDef.data().dataset(datasetName),
			values = dataset.values(),
			points;

		points = plotArea.selectAll(".ggjs-point")
				.data(values)
			.enter().append("circle")
				.attr("class", "ggjs-point")
				.attr("r", 3.5)
				.attr("cx", function (d) { return xScale(d[xField]); })
				.attr("cy", function (d) { return yScale(d[yField]); });

		this.applyFillColour(points, aesmappings);
		
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
			dataset = plotDef.data().dataset(datasetName),
			values = dataset.values(),
			xField, yField, labelField,
			points;

		if (xAes == null) throw "Cannot draw text layer, x aesthetic no specified";
		if (yAes == null) throw "Cannot draw text layer, y aesthetic no specified";

		xField = xAes.field();
		yField = yAes.field();
		labelField = labelAes == null ? null : labelAes.field();
		if (labelField == null) {
			this.warning("No text field supplied for text layer, label will be blank.");
		}

		points = plotArea.selectAll("text.ggjs-label")
				.data(values)
			.enter().append("text")
				.attr("class", "ggjs-label")
				.attr("x", function (d) { return xScale(d[xField]); })
				.attr("y", function (d) { return yScale(d[yField]); })
				.text(function (d) { 
					if (labelField != null) {
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
			dataset = plotDef.data().dataset(datasetName),
			values = dataset.values(),
			isStacked = layerDef.useStackedData(),
			bars;

		// Stacked/dodged bar charts
		// ToDo: dodge bar charts
		if (isStacked) {
			// Work out new baseline for each x value
			var fillScaleDef = this.scaleDef(fillAesMap.scale());
			if (fillScaleDef == null) {
				throw "No scale could be found for fill scale " + fillAesMap.scale();
			}

			if (this.xAxisScaleDef().isOrdinal() && fillScaleDef.isOrdinal()) {
				values = ggjs.dataHelper.generateStackYValues(values, xField, fillAesMap.field(), yField);
			} else {
				throw "Do not know how to draw stacked/dodged bars with non ordinal scales."
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
				throw "Don't know how to draw bars for co-ordinate system " + plotDef.coord();
		}

		this.applyFillColour(bars, aesmappings);
		
	};

	prototype.drawCartesianBars = function (plotArea, values, xField, yField, xScale, yScale, yAxisHeight, isStacked) {
		var bars = plotArea.selectAll("rect.ggjs-bar")
				.data(values)
			.enter().append("rect")
				.attr("class", "ggjs-bar")
				.attr("x", function(d) { return xScale(d[xField]); })
				.attr("y", function(d) { 
					if (isStacked) {
						return yScale(d[yField] + d["__y0__"]); 
					} else {
						return yScale(d[yField]); 
					}
				})
				.attr("height", function(d) { return yAxisHeight - yScale(d[yField]); })
				.attr("width", xScale.rangeBand());
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
				.attr("d", arc)
		return bars;
	};

	prototype.applyFillColour = function (svgItems, aesmappings) {
		// Applies fill colour to svg elements
		// Params:
		//	svgItems: the svg elements as D3 select list
		//	aesmappings: the layer's aesmappings

		// Fill colour
		// ToDo: setup colour scale across all layers, so colours
		// are matched across layers
		console.log("Warning: move colour mapping to all levels.");
		var plotDef = this.plotDef(),
			fillAesMap = aesmappings.findByAes("fill");
		if (fillAesMap != null) {
			var colorField = fillAesMap.field(),
				colorScaleDef = this.scaleDef(fillAesMap.scale()),
				colorScale;
			if (colorScaleDef == null) {
				this.warning("Couldn't set colour on layer - no valid colour scale.")
			} else {
				colorScale = this.scale(colorScaleDef);
				svgItems.style("fill", function(d) { return colorScale(d[colorField]); });
			}
			
		}
	};

	prototype.drawAxes = function (plot) {
		var plotDef = this.plotDef();

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
					.call(xAxis);
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
			default:
				throw "Unrecognised coordinate system used."
		}
	};

	prototype.xAxis = function (val) {
		if (!arguments.length) return this.renderer.xAxis;
		this.renderer.xAxis = val;
		return this;
	};

	prototype.yAxis = function (val) {
		if (!arguments.length) return this.renderer.yAxis;
		this.renderer.yAxis = val;
		return this;
	};

	prototype.xAxisScaleDef = function (val) {
		if (!arguments.length) return this.renderer.xAxisScaleDef;
		this.renderer.xAxisScaleDef = val;
		return this;
	};

	prototype.yAxisScaleDef = function (val) {
		if (!arguments.length) return this.renderer.yAxisScaleDef;
		this.renderer.yAxisScaleDef = val;
		return this;
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
			dataset = plotDef.data().dataset(datasetName);
			if (dataset == null) {
				throw "Unable to find dataset with name " + datasetName;
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
					if (statVal == null) statVal = tmpStat;
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

		if (valueAes == null) {
			throw "Need value aes map to find stacked value";
		}
		if (xAes == null) {
			throw "Need x aes map to find stacked value";
		}
		if (fillAes == null) {
			throw "Need fill aes map to find stacked value";
		}

		if (aes === "y") {
			// ToDo: is the fill aes the only way to specify stacked figures?
			tmpStat = ggjs.dataHelper.maxStackValue(dataset.values(), 
				xAes.field(), fillAes.field(), valueAes.field());
		} else {
			throw "Don't know how to find stacked value for value aes " + aes;
		}

		return tmpStat;
	}

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

			// Layer data
			datasetName = layer.data();
			if (!datasetName) {
				datasetName = plotDef.defaultDatasetName();
			}
			dataset = plotDef.data().dataset(datasetName);
			if (dataset == null) {
				throw "Unable to find dataset with name " + datasetName;
			}

			if (aesmap) {
				field = aesmap.field();
				
				if (dataset.values().map) {
					tmpVals = dataset.values().map(function (d) { return d[field]; });
				} else {
					// backup way to get values from data
					// ToDo: use array.map polyfill so this can be removed?
					var tmpVals = [],
						dsVals = dataset.values(),
						j;
					this.warning("Old browser - doesn't support array.map");
					for (j = 0; j < dsVals.length; j++) {
						tmpVals.push(dsVals[j][field]);
					}
				}
				values = d3.merge([ values, tmpVals ]);
			}
		}

		return values;
	};

	prototype.setupAxisScale = function (aes, scale, scaleDef) {
		var min = 0,
			max,
			allValues = [];

		// If scale domain hasn't been set, use data to find it
		if (!scaleDef.hasDomain()) {
			if (scaleDef.isQuantitative()) {
				max = this.statAcrossLayers(aes, "max");
				if (!isNaN(max)) {
					scale.domain([0, max]).nice();
				}
			} else if (scaleDef.isOrdinal()) {
				allValues = this.allValuesAcrossLayers(aes);
				scale.domain(allValues);
				//scale.domain(data.map(function(d) { return d.letter; }));
			}
		}
		
	};

	prototype.setupXAxis = function () {
		// Produces D3 x axis
		var plotDef = this.plotDef(),
			axis = d3.svg.axis()
				.orient("bottom"),
			axisDef = this.plotDef().axes().axis("x") || {},
			scaleRef = axisDef.scale(),
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
					scale.rangeRoundBands([0, plotDef.plotAreaWidth()], .1);
				}
				break;
			case "polar":
				scale.range([0, 2 * Math.PI]);
				if (scaleDef.isOrdinal()) {
					scale.rangeBands([0, 2 * Math.PI], 0);
				}
				break;
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
			scaleRef = axisDef.scale(),
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
		}

		this.setupAxisScale("y", scale, scaleDef);
		axis.scale(scale);

		axis.ticks(5);

		this.yAxisScaleDef(scaleDef);
		this.yAxis(axis);
	};

	prototype.scaleDef = function (scaleName) {
		return this.plotDef().scales().scale(scaleName);
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
				throw "Unknow D3 scale type " + scaleDef.type();
		}

		if (scale == null) {
			scale = d3.scale.linear();
		}

		return scale;
	};

	return renderer;
})(d3);

ggjs.renderer = function(s) {
  return new ggjs.Renderer(s);
};

// ------------------
// Data Helper
// ------------------

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
					throw "Can't get datatables stat, unknown stat " + stat;
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
							if (statVal == null) statVal = tmpStat;
							statVal = stat === "min" ? Math.min(statVal, tmpStat) : Math.max(statVal, tmpStat);
						}
					}
					break;
				default:
					throw "Can't get datatables stat, unknown stat " + stat;
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
						values["__y0__"] = prevValue;
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
				.rollup(function(leaves) { return {"stack_sum": d3.sum(leaves, function(d) {return d[valueField];})} })
				.entries(data);

			// Find max value across stack groupings
			max = d3.max(nested_data, function (d) { return d.values.stack_sum; })

			return max;
		};;

	return {
		datatableMin: datatableMin,
		datatableMax: datatableMax,
		datatableSum: datatableSum,
		datatableStat: datatableStat,
		datatablesStat: datatablesStat,
		generateStackYValues: generateStackYValues,
		maxStackValue: maxStackValue
	}
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
	}
})();