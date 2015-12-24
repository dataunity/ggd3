define(['../../lib/d3.js', 'ggjs'], function(d3, ggjs) {
	describe("Test modules", function() {
		// Checks that all the ggjs modules are present in the ggjs
		// namespace. Other tests check the details of mocules.
		var rendererTypeLeaflet = "leaflet";

		it("should find the util module", function () {
			expect(typeof ggjs.util).toEqual("object");
		});

		it("should find the util.array module", function () {
			expect(typeof ggjs.util.array).toEqual("object");
		});

		it("should find the Dataset constructor", function () {
			expect(typeof ggjs.Dataset).toEqual("function");
		});

		it("should find the dataset constructor", function () {
			expect(typeof ggjs.dataset).toEqual("function");
		});

		it("should find the Data constructor", function () {
			expect(typeof ggjs.Data).toEqual("function");
		});

		it("should find the datasets constructor", function () {
			expect(typeof ggjs.datasets).toEqual("function");
		});

		it("should find the Axis constructor", function () {
			expect(typeof ggjs.Axis).toEqual("function");
		});

		it("should find the axis constructor", function () {
			expect(typeof ggjs.axis).toEqual("function");
		});

		it("should find the Axes constructor", function () {
			expect(typeof ggjs.Axes).toEqual("function");
		});

		it("should find the axes constructor", function () {
			expect(typeof ggjs.axes).toEqual("function");
		});

		it("should find the Scale constructor", function () {
			expect(typeof ggjs.Scale).toEqual("function");
		});

		it("should find the scale constructor", function () {
			expect(typeof ggjs.scale).toEqual("function");
		});

		it("should find the Scales constructor", function () {
			expect(typeof ggjs.Scales).toEqual("function");
		});

		it("should find the scales constructor", function () {
			expect(typeof ggjs.scales).toEqual("function");
		});

		it("should find the Padding constructor", function () {
			expect(typeof ggjs.Padding).toEqual("function");
		});

		it("should find the padding constructor", function () {
			expect(typeof ggjs.padding).toEqual("function");
		});

		it("should find the AesMapping constructor", function () {
			expect(typeof ggjs.AesMapping).toEqual("function");
		});

		it("should find the aesmapping constructor", function () {
			expect(typeof ggjs.aesmapping).toEqual("function");
		});

		it("should find the AesMappings constructor", function () {
			expect(typeof ggjs.AesMappings).toEqual("function");
		});

		it("should find the aesmappings constructor", function () {
			expect(typeof ggjs.aesmappings).toEqual("function");
		});

		it("should find the Geom constructor", function () {
			expect(typeof ggjs.Geom).toEqual("function");
		});

		it("should find the geom constructor", function () {
			expect(typeof ggjs.geom).toEqual("function");
		});

		it("should find the Layer constructor", function () {
			expect(typeof ggjs.Layer).toEqual("function");
		});

		it("should find the layer constructor", function () {
			expect(typeof ggjs.layer).toEqual("function");
		});

		it("should find the Layers constructor", function () {
			expect(typeof ggjs.Layers).toEqual("function");
		});

		it("should find the layers constructor", function () {
			expect(typeof ggjs.layers).toEqual("function");
		});

		it("should find the Plot constructor", function () {
			expect(typeof ggjs.Plot).toEqual("function");
		});

		it("should find the plot constructor", function () {
			expect(typeof ggjs.plot).toEqual("function");
		});

		it("should find the Renderer constructor", function () {
			expect(typeof ggjs.Renderer).toEqual("function");
		});

		it("should find the Leaflet Renderer constructor", function () {
			expect(typeof ggjs.LeafletRenderer).toEqual("function");
		});

		it("should find the renderer layer plugins module", function () {
			expect(typeof ggjs.layerRendererPlugins).toEqual("object");
		});

		it("should have a layer renderer for Leaflet mercator GeomGeoTiles", function () {
			var renderer = ggjs.layerRendererPlugins.getLayerRenderer(rendererTypeLeaflet, 
				"mercator", "GeomGeoTiles");
			expect(renderer).not.toBe(null);
		});

		it("should have a layer renderer for Leaflet mercator GeomPoint", function () {
			var renderer = ggjs.layerRendererPlugins.getLayerRenderer(rendererTypeLeaflet, 
				"mercator", "GeomPoint");
			expect(renderer).not.toBe(null);
		});

		it("should find the renderer constructor", function () {
			expect(typeof ggjs.renderer).toEqual("function");
		});

		it("should find the dataHelper module", function () {
			expect(typeof ggjs.dataHelper).toEqual("object");
		});

		it("should find the GeoJSON module", function () {
			expect(typeof ggjs.geomGeoJSON).toEqual("object");
		});
		
		it("should find the ggjs module", function () {
			expect(typeof ggjs.ggjs).toEqual("object");
		});
	});
});