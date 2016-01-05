// SVG renderer
ggjs.SVGRenderer = (function (d3, layerRendererPlugins) {
    var svgRenderer = function (plotDef) {
        this._plotDef = plotDef;

        // Width: autoset width if width is missing
        var width = this._plotDef.width(),
            parentWidth;
        if (typeof width === 'undefined' || width === null) {
            // Set width to parent container width
            try {
                parentWidth = d3.select(this._plotDef.selector()).node().offsetWidth;
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
        d3.select(plotDef.selector()).html("");

        // Add the main SVG element
        plotSVG = d3.select(plotDef.selector())
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