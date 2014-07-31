describe("Module: ggd3.Layer", function() {
	
	describe("layer initialisation", function() {
		it("should initialise the layer with data", function() {
			var layer = ggd3.layer( {data: "myDataset"} );
			expect(layer.data()).toEqual("myDataset");
		});

		it("should initialise the layer with geom", function() {
			var layer = ggd3.layer( {geom: "text"} );
			expect(layer.geom()).toEqual("text");
		});

		it("should initialise the layer with aesthetic mappings", function() {
			var layer = ggd3.layer({
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

	});
});