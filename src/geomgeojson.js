// Helper for drawing GeoJSON layers
ggjs.geomGeoJSON = (function (d3) {
    // TODO: Simplify function signature so it takes render object and layer def
    var drawGeoJSONLayer = function (plotArea, values, aesmappings, xField, yField, xScale, yScale,
            projection, zoom) {
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
            var path = d3.geo.path()
                    .projection(projection),
                svg = plotArea;


            console.log("drawing geojson layer.");
            console.log("values", values);

            // TODO: Only draws FeatureCollection at the moment
            // TODO: Check the geojson type
            svg.append("g")
                    .attr("class", "counties")
                .selectAll("path")
                    .data(values.features)
                .enter().append("path")
                    // .attr("class", function(d) { return quantize(rateById.get(d.id)); })
                    .attr("fill", "gray")
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
        };
    return {
        drawGeoJSONLayer: drawGeoJSONLayer
    };
}(d3));