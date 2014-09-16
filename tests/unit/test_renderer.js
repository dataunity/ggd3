describe("Module: ggjs.Renderer", function() {
	var specOneDatasetNoLayers = {
	        "selector": "#chart",
	        "coord": "cartesian",
	        "width": 400,
	        "height": 400,
	        "padding": {"left":30, "top":10, "bottom":30, "right":10},
	        "data": [
	            {
	                "name": "data",
	                "values": [
	                    {"x": 0.5, "y": 0.5, "type": "a"},
	                    {"x": 1.5, "y": 1.5, "type": "a"},
	                    {"x": 2.5, "y": 2.5, "type": "b"}
	                ]
	            }
	        ],
	        "scales": [
	            {"name": "x"},
	            {"name": "y", "domain": [0, 3]}
	        ],
	        "axes": [
	            {"type": "x", "scale": "x"},
	            {"type": "y", "scale": "y"}
	        ]
	    },
	    specMultiLayerDatasets = {
	        "selector": "#chart",
	        "coord": "cartesian",
	        "width": 400,
	        "height": 400,
	        "padding": {"left":30, "top":10, "bottom":30, "right":10},
	        "data": [
	            {
	                "name": "data1",
	                "values": [
	                    {"x": 0.5, "y": 0.5, "type": "a"},
	                    {"x": 1.5, "y": 1.5, "type": "a"},
	                    {"x": 2.5, "y": 2.5, "type": "b"}
	                ]
	            },
	            {
	                "name": "data2",
	                "values": [
	                    {"x2": 10.5, "y2": 100.5, "type": "a"},
	                    {"x2": 11.5, "y2": 101.5, "type": "c"},
	                    {"x2": 12.5, "y2": 102.5, "type": "b"}
	                ]
	            }
	        ],
	        "scales": [
	            {"name": "x"},
	            {"name": "y", "domain": [0, 3]}
	        ],
	        "axes": [
	            {"type": "x", "scale": "x"},
	            {"type": "y", "scale": "y"}
	        ],
	        "layers": [
	            {
	                "aesmappings": [
	                    {aes: "x", field: "x"},
	                    {aes: "y", field: "y"}
	                ],
	                "data": "data1",
	                "geom": "point",
	                "stat": null,
	                "posadj": null
	            },
	            {
	                "aesmappings": [
	                    {aes: "x", field: "x2"},
	                    {aes: "y", field: "y2"}
	                ],
	                "data": "data2",
	                "geom": "point"
	            }
	        ]
	    };
	
	describe("renderer data", function() {
		it("should find min x value across layers", function() {
			var plotDef = ggjs.plot(specMultiLayerDatasets),
				renderer = ggjs.renderer(plotDef);
			expect(renderer.statAcrossLayers("x", "min")).toEqual(0.5);
		});

		it("should find max x value across layers", function() {
			var plotDef = ggjs.plot(specMultiLayerDatasets),
				renderer = ggjs.renderer(plotDef);
			expect(renderer.statAcrossLayers("x", "max")).toEqual(12.5);
		});

		it("should find max x value across layers with default dataset", function() {
			var spec = specOneDatasetNoLayers,
				plotDef, renderer;
			spec.layers = [
	            {
	                "aesmappings": [
	                    {aes: "x", field: "x"},
	                    {aes: "y", field: "y"}
	                ],
	                // Note: no dataset specified so default dataset used
	                //"data": "data",
	                "geom": "point"
	            }
	        ];
	        plotDef = ggjs.plot(spec);
	        renderer = ggjs.renderer(plotDef);
			expect(renderer.statAcrossLayers("x", "max")).toEqual(2.5);
		});

		it("should find all values for across layers", function () {
	        var spec = {
			        "selector": "#chart",
			        "coord": "cartesian",
			        "data": [
			            {
			                "name": "data",
			                "values": [
			                    {"x": 0.5, "y": 0.5, "type": "a"},
			                    {"x": 1.5, "y": 1.5, "type": "a"},
			                    {"x": 2.5, "y": 2.5, "type": "b"}
			                ]
			            },
			            {
			                "name": "data2",
			                "values": [
			                    {"x": 0.5, "y": 0.5, "type": "c"},
			                    {"x": 1.5, "y": 1.5, "type": "a"},
			                    {"x": 2.5, "y": 2.5, "type": "d"}
			                ]
			            }
			        ],
			        "scales": [
			            {"name": "x"},
			            {"name": "y", "domain": [0, 3]}
			        ],
			        "axes": [
			            {"type": "x", "scale": "x"},
			            {"type": "y", "scale": "y"}
			        ],
			        "layers": [
			            {
			                "aesmappings": [
			                    {aes: "x", field: "type"},
			                    {aes: "y", field: "y"}
			                ],
			                "data": "data",
			                "geom": "point"
			            },
			            {
			                "aesmappings": [
			                    {aes: "x", field: "type"},
			                    {aes: "y", field: "y"}
			                ],
			                "data": "data2",
			                "geom": "point"
			            }
			        ]
			    },
			    plotDef, renderer, vals;

	        plotDef = ggjs.plot(spec);
	        renderer = ggjs.renderer(plotDef);
	        vals = renderer.allValuesAcrossLayers("x");
			expect(vals.sort()).toEqual(["a", "a", "a", "b", "c", "d"]);
		});

		it("should find max for across layers with stacked data", function () {
	        var spec = {
			        "selector": "#chart",
			        "coord": "cartesian",
			        "data": [
			            {
			                "name": "data",
			                "values": [
			                    {"x": "x1", "y": 0.5, "type": "a"},
			                    {"x": "x1", "y": 1.5, "type": "a"},
			                    {"x": "x1", "y": 2.5, "type": "b"}
			                ]
			            },
			            {
			                "name": "data2",
			                "values": [
			                    {"x": "x1", "y": 0.0, "type": "a"},
			                    {"x": "x1", "y": 1.0, "type": "b"},
			                    {"x": "x1", "y": 1.5, "type": "c"},
			                    {"x": "x2", "y": 2.0, "type": "a"},
			                    {"x": "x2", "y": 2.5, "type": "b"},
			                    {"x": "x2", "y": 3.0, "type": "c"}
			                ]
			            }
			        ],
			        "scales": [
			            {"name": "x"},
			            {"name": "y", "domain": [0, 3]}
			        ],
			        "axes": [
			            {"type": "x", "scale": "x"},
			            {"type": "y", "scale": "y"}
			        ],
			        "layers": [
			            {
			                "aesmappings": [
			                    {aes: "x", field: "x"},
			                    {aes: "y", field: "y"}
			                ],
			                "data": "data",
			                "geom": "point"
			            },
			            // This layer is stacked data (stacked bar)
			            {
			                "aesmappings": [
			                    {aes: "x", field: "x"},
			                    {aes: "y", field: "y"},
			                    {aes: "fill", field: "type"}
			                ],
			                "data": "data2",
			                "geom": "bar",
			                "position": "stack"
			            }
			        ]
			    },
			    plotDef, renderer, val;

	        plotDef = ggjs.plot(spec);
	        renderer = ggjs.renderer(plotDef);
	        
	        // Should sum up the values in the second layer to get
	        // max as it's a stacked data layer

	        // First method
	        var layer = plotDef.layers().asArray()[1],
	        	dataset = plotDef.data().dataset("data2"),
	        	aes = "y";
	        val = renderer.layerStackedDataMax(layer, dataset, aes);
			expect(val).toEqual(7.5);

	        // Second method (uses first method behind the scenes)
	        val = renderer.statAcrossLayers("y", "max");
			expect(val).toEqual(7.5);
		});
	});

	describe("scales", function() {
		it("should find scale def", function() {
			var spec = {
			        "selector": "#chart",
			        "coord": "cartesian",
			        "scales": [
			            {"name": "x"},
			            {"name": "y"}
			        ]
			    },
	    		plotDef = ggjs.plot(spec),
				renderer = ggjs.renderer(plotDef);
			expect(renderer.scaleDef("x").name()).toEqual("x");
		});
	});

});