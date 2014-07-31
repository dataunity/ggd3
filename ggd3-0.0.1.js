var ggd3 = ggd3 || {};

// ------------------
// Utilities
// ------------------

ggd3.util = (function () {
	var isUndefined = function (val) {
			return typeof val === 'undefined';
		};

	return {
		isUndefined: isUndefined
	}
})();


// ------------------
// Axes
// ------------------

ggd3.Axis = (function() {
	var axis = function(spec) {
		spec = spec || {};
		if (ggd3.util.isUndefined(spec.type)) throw "The axis type must be defined";
		this.axis = {
			type: spec.type,
			scale: spec.scale || null
		};
		//if (s) ggd3.extend(this.axis, s);
	};

	var prototype = axis.prototype;

	prototype.type = function (val) {
		if (!arguments.length) return this.axis.type;
		this.axis.type = val;
		return this;
	};

	prototype.scale = function(val) {
		if (!arguments.length) return this.axis.scale;
		// ToDo: set as object, ggd3 scale (or either)?
		this.axis.scale = val;
		return this;
	};

	return axis;
})();

ggd3.axis = function(s) {
  return new ggd3.Axis(s);
};

ggd3.Axes = (function() {
	var axes = function(s) {
		var i, axis;
		this.axes = {};
		if (s) {
			for (i = 0; i < s.length; i++) {
				axis = ggd3.axis(s[i]);
				this.axes[axis.type()] = axis;
			}
		}
	};

	var prototype = axes.prototype;

	prototype.axis = function(axisType, axis) {
		// ToDo: Get or set axis
		if (arguments.length < 1) throw "axis function needs axisType argument.";
		if (arguments.length == 1) return this.axes[axisType];
		this.axes[axisType] = ggd3.axis(axis);
		return this;
	};

	prototype.count = function() {
		var size = 0, key;
	    for (key in this.axes) {
	        if (this.axes.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	return axes;
})();

ggd3.axes = function(s) {
  return new ggd3.Axes(s);
};


// ------------------
// Scales
// ------------------

ggd3.Scale = (function () {
	var scale = function(spec) {
		this.scale = {
			domain: spec.domain || null,
			type: spec.type || null,
			name: spec.name || null
		};
		//if (spec) ggd3.extend(this.scale, spec);
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

	return scale;
})();

ggd3.scale = function(s) {
	return new ggd3.Scale(s);
};

ggd3.Scales = (function() {
	var scales = function(s) {
		var i, scale;
		this.scales = {};
		if (s) {
			for (i = 0; i < s.length; i++) {
				scale = ggd3.scale(s[i]);
				this.scales[scale.name()] = scale;
			}
		}
	};

	var prototype = scales.prototype;

	prototype.scale = function(scaleName, scale) {
		// Gets or set scale by name
		if (arguments.length < 1) throw "scale function needs scaleName argument.";
		if (arguments.length == 1) return this.scales[scaleName];
		this.scales[scaleName] = ggd3.scale(scale);
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

ggd3.scales = function(s) {
  return new ggd3.Scales(s);
};


// ------------------
// Padding
// ------------------

ggd3.Padding = (function () {
	var padding = function(s) {
		this.padding = {
			left: s.left || 20,
			right: s.right || 20,
			top: s.top || 20,
			bottom: s.bottom || 20
		};
		//if (s) ggd3.extend(this.padding, s);
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

ggd3.padding = function(s) {
	return new ggd3.Padding(s);
};



// ------------------
// Aesthetic mappings
// ------------------

ggd3.AesMapping = (function () {
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
			field: s.field || null
		};
		//if (s) ggd3.extend(this.aesmap, s);
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

	return aesmap;
})();

ggd3.aesmapping = function(s) {
  return new ggd3.AesMapping(s);
};

ggd3.AesMappings = (function () {
	var aesmappings = function(spec) {
		var i;
		this.aesmappings = [];
		for (i = 0; i < spec.length; i++) {
			this.aesmappings.push(ggd3.aesmapping(spec[i]));
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

ggd3.aesmappings = function(s) {
  return new ggd3.AesMappings(s);
};


// ------------------
// Layers
// ------------------

ggd3.Layer = (function () {
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
		this.layer = {
			data: spec.data || null,
			geom: spec.geom || null,
			aesmappings: ggd3.aesmappings(spec.aesmappings || [])
		};
		//if (s) ggd3.extend(this.layer, s);
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

	prototype.aesmappings = function (val) {
		if (!arguments.length) return this.layer.aesmappings;
		// ToDo: should val be obj or Axes (or either)?
		this.layer.aesmappings = val;
		return this;
	};

	return layer;
})();

ggd3.layer = function(s) {
  return new ggd3.Layer(s);
};

ggd3.Layers = (function () {
	var layers = function(spec) {
		var i;
		this.layers = [];
		for (i = 0; i < spec.length; i++) {
			this.layers.push(ggd3.layer(spec[i]));
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

ggd3.layers = function(s) {
  return new ggd3.Layers(s);
};

// ------------------
// Plot
// ------------------

ggd3.Plot = (function () {
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
			padding: ggd3.padding(spec.padding || {}),
			data: spec.data || [],
			// ToDo: automatically find co-ordinate system based on layers?
			coord: spec.coord || "cartesian",
			scales: ggd3.scales(spec.scales|| []),
			axes: ggd3.axes(spec.axes || []),
			facet: spec.facet || null,
			layers: ggd3.layers(spec.layers || [])
		};
		//if (spec) ggd3.extend(this.plot, spec);
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
		this.plot.padding = ggd3.padding(val);
		return this;
	};

	prototype.coord = function (val) {
		if (!arguments.length) return this.plot.coord;
		this.plot.coord = val;
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

	return plot;
})();

ggd3.plot = function(p) {
  return new ggd3.Plot(p);
};

ggd3.Renderer = (function (d3) {
	var renderer = function(s) {
		this.renderer = {
			plotDef: s
		};
	};

	var prototype = renderer.prototype;

	prototype.plotDef = function (val) {
		if (!arguments.length) return this.renderer.plotDef;
		this.renderer.plotDef = val;
		return this;
	};

	prototype.render = function () {
		var plotDef = this.plotDef(),
			plot = d3.select(plotDef.selector())
				.append("svg")
					.attr("width", plotDef.width())
					.attr("height", plotDef.height());

		// Axes
		switch (plotDef.coord()) {
			case "cartesian":
				// Need an x and y axis
				// ToDo: support x2 and y2 axes
				//var xAxisDef = plotDef.axes().axis("x");
				var xAxis = this.xAxis(),
					yAxis = this.yAxis();
				plot.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaHeight() + ")")
					.call(xAxis);
				// ToDo: append x axis title
				plot.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaY() + ")")
					.call(yAxis);
				// ToDo: append x axis title

				break;
			default:
				throw "Unrecognised coordinate system used."
		}
	};

	prototype.xAxis = function () {
		// Produces D3 x axis
		var plotDef = this.plotDef(),
			axis = d3.svg.axis()
				.orient("bottom"),
			axisDef = this.plotDef().axes().axis("x") || {},
			scaleDefRef = axisDef.scale(),
			scaleDef = plotDef.scales().scale(scaleDefRef),
			scale = this.scale(scaleDef);

		// X scale range is always width of plot area
		// ToDo: account for facets
		scale.range([0, plotDef.plotAreaWidth()]);
		axis.scale(scale);

		axis.ticks(5);

		return axis;
	};

	prototype.yAxis = function () {
		// Produces D3 y axis
		var plotDef = this.plotDef(),
			axis = d3.svg.axis()
				.orient("left"),
			axisDef = this.plotDef().axes().axis("y") || {},
			scaleDefRef = axisDef.scale(),
			scaleDef = plotDef.scales().scale(scaleDefRef),
			scale = this.scale(scaleDef);

		// Y scale range is always height of plot area
		// ToDo: account for facets
		scale.range([plotDef.plotAreaHeight(), 0]);
		axis.scale(scale);

		axis.ticks(5);

		return axis;
	};

	prototype.scale = function (scaleDef) {
		// Produces D3 scale
		var scale = null;
		scaleDef = scaleDef || ggd3.scale({});
		switch (scaleDef.type()) {
			case "linear":
				scale = d3.scale.linear();
				break;
			case "pow":
				scale = d3.scale.pow();
				break;
		}

		if (scale == null) {
			scale = d3.scale.linear();
		}

		return scale;
	};

	return renderer;
})(d3);

ggd3.renderer = function(s) {
  return new ggd3.Renderer(s);
};

// ggd3.renderer = (function (d3) {
// 	//
// 	var render = function (plotDef) {
// 			var plot = d3.select(plotDef.selector())
// 					.append("svg")
// 						.attr("width", plotDef.width())
// 						.attr("height", plotDef.height());

// 			// Axes
// 			switch (plot.coord()) {
// 				case "cartesian":
// 					// Need an x and y axis
// 					// ToDo: support x2 and y2 axes
// 					var axis = d3.svg.axis() // <-D
// 						.scale(scale) // <-E
// 						.orient(orient) // <-F
// 						.ticks(5);

// 					break;
// 				default:
// 					throw "Unrecognised coordinate system used."
// 			}
// 		};

// 	return {
// 		render: render
// 	};
// })(d3);


ggd3.ggd3 = (function () {
	// Init
	var render = function (spec) {
		// ToDo: set spec defaults

		// Load spec
		var plotDef = ggd3.plot(spec);

		// Render chart
		ggd3.renderer(plotDef).render();

		

	};

	return {
		render: render
	}
})();