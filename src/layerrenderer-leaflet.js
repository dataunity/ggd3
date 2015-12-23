// Registers a plugin that can render a plot layer for Leaflet map tiles
(function (L, layerRendererPlugins) {
    var onAdd = function (map) {
            // Add new layer
            map.addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
        },
        onRemove = function (map) {
            throw new Error("Not implemented.");
        },
        renderer = {
            onAdd: onAdd,
            onRemove: onRemove
        },
        registerLayerRenderer = function (renderer) {
            var coord = "mercator",
                geom = "GeomGeoTiles";
            layerRendererPlugins.addLayerRenderer(coord, geom, renderer);
        };

    // Register plugin
    registerLayerRenderer(renderer);
}(L, ggjs.layerRendererPlugins));

// Registers a plugin that can render a plot layer for Leaflet GeoJSON
(function (L, d3, layerRendererPlugins) {
    // Create a class that implements the Layer interface
    var D3Layer = L.Class.extend({

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
        });
    var onAdd = function (map, values) {
            // Create a layer with data
            map.addLayer(new D3Layer(values));
            
            /*
            var svg = d3.select(map.getPanes().overlayPane).append("svg"),
                g = svg.append("g").attr("class", "leaflet-zoom-hide");

            var transform = d3.geo.transform({point: projectPoint}),
                  path = d3.geo.path().projection(transform);

              var feature = g.selectAll("path")
                  .data(collection.features)
                .enter().append("path");

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
              */
        },
        onRemove = function (map) {
            throw new Error("Not implemented.");
        },
        renderer = {
            onAdd: onAdd,
            onRemove: onRemove
        },
        registerLayerRenderer = function (renderer) {
            var coord = "mercator",
                geom = "GeomGeoJSON";
            console.log("Registering renderer", coord, geom);
            layerRendererPlugins.addLayerRenderer(coord, geom, renderer);
        };

    // Register plugin
    registerLayerRenderer(renderer);
}(L, d3, ggjs.layerRendererPlugins));