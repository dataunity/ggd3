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
            },

            onAdd: function(map) {

                // Create SVG elements under the overlay pane
                var div = d3.select(map.getPanes().overlayPane),
                    svg = div.selectAll('svg.point').data(this._data),
                    latField = this._latField,
                    longField = this._longField;

                // Stores the latitude and longitude of each city
                this._data.forEach(function(d) {
                    d.LatLng = new L.LatLng(+d[latField], +d[longField]);
                });

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

        map.addLayer(new D3Layer(values, xField, yField));
    };

    prototype.onRemove = function (map) {
        throw new Error("Not implemented.");
    };

    // Register plugin
    registerLayerRenderer(layerRenderer);
    // registerLayerRenderer(renderer);
}(L, d3, ggjs.layerRendererPlugins));