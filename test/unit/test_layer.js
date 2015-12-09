describe("Module: ggjs.Layer", function() {
	
	describe("layer initialisation", function() {
		it("should initialise the layer with data", function() {
			var layer = ggjs.layer( {data: "myDataset"} );
			expect(layer.data()).toEqual("myDataset");
		});

		it("should initialise the layer with geom", function() {
			var layer = ggjs.layer( {geom: {geomType: "GeomText"}} );
			expect(layer.geom().geomType()).toEqual("GeomText");
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

		it("should initialise the layer with Linked Data aesthetic mappings", function() {
			// It's easier to represent the aesmapping collection as an array
			// called 'aesmapping' rather than 'aesmappings' when using Linked Data.
			var layer = ggjs.layer({
				aesmapping: [
					{
						aes: "x",
						field: "field1"
					}
				]
			});
			expect(layer.aesmappings().count()).toEqual(1);
			expect(layer.aesmappings().findByAes("x").field()).toEqual("field1");
		});

		it("should initialise the layer with position", function() {
			var layer = ggjs.layer( {geom: {geomType: "text"}, position: "dodge"} );
			expect(layer.position()).toEqual("dodge");
		});

		it("should initialise the layer with orderId", function() {
			var layer = ggjs.layer( {geom: {geomType: "text"}, orderId: 7} );
			expect(layer.orderId()).toEqual(7);
		});
	});

	describe("layer info", function() {
		it("should identify stacked bar as needing stacked data", function() {
			var layer = ggjs.layer({
				geom: {geomType: "GeomBar"},
				position: "stack",
				aesmappings: [
						{ aes: "x", field: "field1" },
						{ aes: "fill", field: "field2" }
					]});
			expect(layer.useStackedData()).toBe(true);
		});
	});
});