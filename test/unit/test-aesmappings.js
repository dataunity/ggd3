define(['../../lib/d3.js', 'ggjs'], function(d3, ggjs) {
	describe("Module: ggjs.AesMappings", function() {
		
		describe("aesmappings", function() {

			it("should initialise aesmappings", function() {
				var aesmappings = ggjs.aesmappings( [{aes: "x", field: "myField"}] );
				expect(aesmappings.count()).toEqual(1);
			});

			it("should initialise aesmappings with two mappings", function() {
				var aesmappings = ggjs.aesmappings([
					{aes: "x", field: "myField1"},
					{aes: "y", field: "myField2"}
				]);
				expect(aesmappings.count()).toEqual(2);
			});

			it("should find aesmapping by aes name", function() {
				var aesmappings = ggjs.aesmappings( [{aes: "x", field: "myField"}] );
				expect(aesmappings.findByAes("x").field()).toEqual("myField");
			});

			it("should return null for unknown aesmapping", function() {
				var aesmappings = ggjs.aesmappings( [] );
				expect(aesmappings.findByAes("missing")).toBe(null);
			});

			it("should get aesmappings as array", function() {
				var aesmappings = ggjs.aesmappings([
					{aes: "x", field: "myField1"},
					{aes: "y", field: "myField2"}
				]);
				var list = aesmappings.asArray();
				expect(list.length).toEqual(2);
				expect(list[0].aes()).toEqual("x");
				expect(list[1].aes()).toEqual("y");
			});

		});

	});
});