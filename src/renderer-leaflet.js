// Leaflet map renderer
ggjs.LeafletRenderer = (function (d3, layerRendererPlugins) {
    var leafletRenderer = function (plotDef) {
        this._plotDef = plotDef;
        var width = plotDef.width(),
            height = plotDef.height(),
            parentWidth, elem, mapElem;
        
        if (typeof width === 'undefined' || width === null) {
            // Set width to parent container width
            try {
                parentWidth = d3.select(plotDef.selector()).node().offsetWidth;
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
        elem = d3.select(plotDef.selector());
        mapElem = elem.append("div")
            .style("height", this._plotDef.height() + "px")
            .style("width", this._plotDef.width() + "px");

        this._map = new L.Map(mapElem.node(), {center: [37.8, -96.9], zoom: 4}); // US
    };

    var prototype = leafletRenderer.prototype;

    prototype.plotDef = function (val) {
        if (!arguments.length) return this._plotDef;
        this._plotDef = val;
        return this;
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
            i, layerDef, plotArea, layerRenderer, geom;

        // Draw each layer
        for (i = 0; i < layerDefs.length; i++) {
            layerDef = layerDefs[i];

            var datasetName = layerDef.data(),
                dataset = this.getDataset(datasetName),
                values = dataset.values();

            geom = layerDef.geom().geomType();
            layerRenderer = layerRendererPlugins.getLayerRenderer(coords, geom);
            if (layerRenderer === null) {
                throw new Error("Couldn't find layer renderer for " + coords + ", " + geom);
            }

            layerRenderer.onAdd(map, values);

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
}(d3, ggjs.layerRendererPlugins));