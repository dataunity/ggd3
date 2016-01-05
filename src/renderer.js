

ggjs.Renderer = (function (d3) {
    var renderer = function (plotDef) {
        this.renderer = {
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
        d3.select(this.plotDef().selector()).select("svg").remove();
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
            renderer,
            plot;

        if (plotDef.coord() === "mercator") {
            renderer = new ggjs.LeafletRenderer(plotDef);
        } else {
            renderer = new ggjs.SVGRenderer(plotDef);
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

ggjs.renderer = function(s) {
    return new ggjs.Renderer(s);
};
