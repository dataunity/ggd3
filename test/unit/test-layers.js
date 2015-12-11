define(['../../lib/d3.js', 'ggjs'], function(d3, ggjs) {
	describe("Module: ggjs.Layers", function() {
		
		describe("layers", function() {

			it("should initialise layers", function() {
				var layers = ggjs.layers( [{geom: {geomType: "text"}}] );
				expect(layers.count()).toEqual(1);
			});

			it("should initialise layers with two layers", function() {
				var layers = ggjs.layers([
					{geom: {geomType: "text"}},
					{geom: {geomType: "area"}}
				]);
				expect(layers.count()).toEqual(2);
			});

			it("should get layers as array", function() {
				var layers = ggjs.layers([
					{geom: {geomType: "text"}},
					{geom: {geomType: "area"}}
				]);
				var list = layers.asArray();
				expect(list.length).toEqual(2);
				expect(list[0].geom().geomType()).toEqual("text");
				expect(list[1].geom().geomType()).toEqual("area");
			});

			it("should order layers by orderId", function() {
				var layers = ggjs.layers([
					{geom: {geomType: "text"}, orderId: 2},
					{geom: {geomType: "area"}, orderId: 1}
				]);
				var list = layers.asArray();
				expect(list.length).toEqual(2);
				expect(list[0].geom().geomType()).toEqual("area");
				expect(list[1].geom().geomType()).toEqual("text");
			});

			it("should order layers by namespaced orderId", function() {
				var layers = ggjs.layers([
					{geom: {geomType: "text"}, "ggjs:orderId": 2},
					{geom: {geomType: "area"}, "ggjs:orderId": 1}
				]);
				var list = layers.asArray();
				expect(list.length).toEqual(2);
				expect(list[0].geom().geomType()).toEqual("area");
				expect(list[1].geom().geomType()).toEqual("text");
			});
		});

	});
});