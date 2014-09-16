describe("Module: ggjs.Layer", function() {
	
	describe("layer initialisation", function() {
		it("should initialise the layer with data", function() {
			var layer = ggjs.layer( {data: "myDataset"} );
			expect(layer.data()).toEqual("myDataset");
		});

		it("should initialise the layer with geom", function() {
			var layer = ggjs.layer( {geom: "text"} );
			expect(layer.geom()).toEqual("text");
		});

		it("should initialise the layer with aesthetic mappings", function() {
			var layer = ggjs.layer({
				aesmappings: [
					{
						aes: "x",
						field: "field1"
					},
					{
						aes: "y",
						field: "field2"
					}
				]
			});
			expect(layer.aesmappings().count()).toEqual(2);
			expect(layer.aesmappings().findByAes("x").field()).toEqual("field1");
			expect(layer.aesmappings().findByAes("y").field()).toEqual("field2");
		});

		it("should initialise the layer with position", function() {
			var layer = ggjs.layer( {geom: "text", position: "dodge"} );
			expect(layer.position()).toEqual("dodge");
		});
	});

	describe("layer info", function() {
		it("should identify stacked bar as needing stacked data", function() {
			var layer = ggjs.layer({
				geom: "bar",
				position: "stack",
				aesmappings: [
						{ aes: "x", field: "field1" },
						{ aes: "fill", field: "field2" }
					]});
			expect(layer.useStackedData()).toBe(true);
		});
	});
});