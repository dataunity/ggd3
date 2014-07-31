describe("Module: ggd3.AesMappings", function() {
	
	describe("aesmappings", function() {

		it("should initialise aesmappings", function() {
			var aesmappings = ggd3.aesmappings( [{aes: "x", field: "myField"}] );
			expect(aesmappings.count()).toEqual(1);
		});

		it("should initialise aesmappings with two mappings", function() {
			var aesmappings = ggd3.aesmappings([
				{aes: "x", field: "myField1"},
				{aes: "y", field: "myField2"}
			]);
			expect(aesmappings.count()).toEqual(2);
		});

		it("should find aesmapping by aes name", function() {
			var aesmappings = ggd3.aesmappings( [{aes: "x", field: "myField"}] );
			expect(aesmappings.findByAes("x").field()).toEqual("myField");
		});

		it("should get aesmappings as array", function() {
			var aesmappings = ggd3.aesmappings([
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