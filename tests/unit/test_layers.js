describe("Module: ggjs.Layers", function() {
	
	describe("layers", function() {

		it("should initialise layers", function() {
			var layers = ggjs.layers( [{geom: "text"}] );
			expect(layers.count()).toEqual(1);
		});

		it("should initialise layers with two layers", function() {
			var layers = ggjs.layers([
				{geom: "text"},
				{geom: "area"}
			]);
			expect(layers.count()).toEqual(2);
		});

		it("should get layers as array", function() {
			var layers = ggjs.layers([
				{geom: "text"},
				{geom: "area"}
			]);
			var list = layers.asArray();
			expect(list.length).toEqual(2);
			expect(list[0].geom()).toEqual("text");
			expect(list[1].geom()).toEqual("area");
		});

		it("should order layers by orderId", function() {
			var layers = ggjs.layers([
				{geom: "text", orderId: 2},
				{geom: "area", orderId: 1}
			]);
			var list = layers.asArray();
			expect(list.length).toEqual(2);
			expect(list[0].geom()).toEqual("area");
			expect(list[1].geom()).toEqual("text");
		});
	});

});