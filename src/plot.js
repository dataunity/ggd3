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
