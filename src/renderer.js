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
        this.geo = {};
        this.dataAttrXField = "data-ggjs-x-field";
        this.dataAttrXValue = "data-ggjs-x-value";
        this.dataAttrYField = "data-ggjs-y-field";
        this.dataAttrYValue = "data-ggjs-y-value";

        // Width: autoset width if width is missing
        var width = plotDef.width(),
            parentWidth;
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
            this.renderer.plotDef.width(parentWidth);
        }
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

    prototype.d3Scale = function (scaleName, val) {
        if (!arguments.length) {
            throw new Error("Must supply args when getting/setting d3 scale");
        }
        else if (arguments.length === 1) {
            return this.renderer.scaleNameToD3Scale[scaleName];
        } else {
            this.renderer.scaleNameToD3Scale[scaleName] = val;
        }
        
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
        var center = projection([-0.1046, 51.46]);  // Lambeth

        var zoom = d3.behavior.zoom()
            .scale(projection.scale() * 2 * Math.PI)
            .scaleExtent([1 << 11, 1 << 14])
            .translate([width - center[0], height - center[1]])
            .on("zoom", this_.drawLayers);
            //.on("zoom", this_.drawLayers(this_.renderer.plot));
            //.on("zoom", zoomed);

        this.geo.zoom = zoom;

        // With the center computed, now adjust the projection such that
        // it uses the zoom behavior’s translate and scale.
        // projection
        //     .scale(1 / 2 / Math.PI)
        //     .translate([0, 0]);

        this.geo.projection = projection;
    };

    // prototype.zoomed = function () {
    //  console.log("Some zooming");
    // }

    prototype.renderPlot = function () {
        var plotDef = this.plotDef(),
            plot;

        // d3.select(this.plotDef().selector()).select("svg").remove();
        d3.select(plotDef.selector()).html("");
        plot = d3.select(plotDef.selector())
            .append("svg")
                .attr("width", plotDef.width())
                .attr("height", plotDef.height());
        this.renderer.plot = plot;

        console.log(plotDef.plotAreaX());
        console.log(plotDef.plotAreaY());
        console.log(plotDef.plotAreaHeight());
        console.log(plotDef.plotAreaWidth());

        // ToDo: if no domain set on axes, default to extent
        // of data for appropriate aes across layers
        this.buildScales();
        this.setupXAxis();
        this.setupYAxis();
        this.setupGeo();

        this.drawAxes();
        this.drawLayers();
        
        this.drawLegends();
    };

    prototype.drawLayers = function () {
        var plotDef = this.plotDef(),
            plot = this.renderer.plot,
            layerDefs = plotDef.layers().asArray(),
            i, layerDef, plotArea;

        // Setup layers
        switch (plotDef.coord()) {
            case "cartesian":
                plotArea = plot.append("g")
                    .attr("transform", "translate(" + plotDef.plotAreaX() + "," + plotDef.plotAreaY() + ")");
                break;
            case "polar":
                plotArea = plot.append("g")
                    .attr("transform", "translate(" + (plotDef.plotAreaX() + Math.floor(plotDef.plotAreaWidth() / 2)) + "," + (plotDef.plotAreaY() + Math.floor(plotDef.plotAreaHeight() / 2)) + ")");
                break;
            case "mercator":
                //plot.call(this.geo.zoom);
                plotArea = plot.append("g")
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

        // Post layer processing
        // switch (plotDef.coord()) {
        //  case "mercator":
        //      break;
        // }
    };

    prototype.drawMapTiles = function (plotArea, layerDef) {
        // Draws geographic map tiles images onto plot area
        console.log("Drawing map tiles");
        var plotDef = this.plotDef(),
            width = plotDef.plotAreaWidth(),
            height = plotDef.plotAreaHeight(),
            zoom = this.geo.zoom,
            projection = this.geo.projection,
            plot = this.renderer.plot;

        //var width = Math.max(960, window.innerWidth),
        //  height = Math.max(500, window.innerHeight);
        var tau = 2 * Math.PI;

        var tile = d3.geo.tile()
            .scale(projection.scale() * tau)
            .translate(projection([0, 0]))
            .size([width, height]);

        var tiles = tile();

        plot.append("g").selectAll("image")
                .data(tiles)
            .enter().append("image")
                .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
                .attr("width", Math.round(tiles.scale))
                .attr("height", Math.round(tiles.scale))
                .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
                .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });



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
            plot = this.renderer.plot;
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
            plot = this.renderer.plot,
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
            // plot = this.renderer.plot,
            output, values;

        values = dataset.values();

        switch (plotDef.coord()) {
            case "mercator":
                // bars = this.drawCartesianBars(plotArea, values, xField, yField, xScale, yScale, yAxisHeight, isStacked);
                output = ggjs.geomGeoJSON.drawGeoJSONLayer(plotArea, values, aesmappings, 
                    xField, yField, 
                    xScale, yScale,
                    projection, zoom);
                break;
            default:
                throw new Error("Don't know how to draw GeoJSON for co-ordinate system " + plotDef.coord());
        }

        // this.applyFillColour(bars, aesmappings);
        
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
            defaultFillColor = this.renderer.defaultFillColor;
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

    prototype.drawAxes = function () {
        var plotDef = this.plotDef(),
            plot = this.renderer.plot;

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
            values = d3.merge([ values, tmpVals ]);

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


    // -------
    // Scales
    // -------

    // Build the scales based on data
    prototype.buildScales = function () {
        var plotDef = this.plotDef(),
            plot = this.renderer.plot,
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
                throw new Error("Unknow D3 scale type " + scaleDef.type());
        }

        if (scale === null) {
            scale = d3.scale.linear();
        }

        return scale;
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
            plot = this.renderer.plot,
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

    return renderer;
})(d3);

ggjs.renderer = function(s) {
    return new ggjs.Renderer(s);
};
