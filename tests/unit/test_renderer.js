describe("Module: ggd3.Renderer", function() {
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
			var plotDef = ggd3.plot(specMultiLayerDatasets),
				renderer = ggd3.renderer(plotDef);
			expect(renderer.statAcrossLayers("x", "min")).toEqual(0.5);
		});

		it("should find max x value across layers", function() {
			var plotDef = ggd3.plot(specMultiLayerDatasets),
				renderer = ggd3.renderer(plotDef);
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
	        plotDef = ggd3.plot(spec);
	        renderer = ggd3.renderer(plotDef);
			expect(renderer.statAcrossLayers("x", "max")).toEqual(2.5);
		});

		it("should find all values for across layers", function () {
			// var spec = specOneDatasetNoLayers,
			// 	plotDef, renderer, vals;
			// spec.layers = [
	  //           {
	  //               "aesmappings": [
	  //                   {aes: "x", field: "type"},
	  //                   {aes: "y", field: "y"}
	  //               ],
	  //               "data": "data",
	  //               "geom": "point"
	  //           }
	  //       ];
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

	        plotDef = ggd3.plot(spec);
	        renderer = ggd3.renderer(plotDef);
	        vals = renderer.allValuesAcrossLayers("x");
			expect(vals.sort()).toEqual(["a", "a", "a", "b", "c", "d"]);
		});
	});

});