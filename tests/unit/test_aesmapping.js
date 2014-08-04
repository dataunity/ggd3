describe("Module: ggd3.AesMapping", function() {
	
	describe("aesmapping initialisation", function() {

		it("should initialise aesmapping", function() {
			var aesmapping = ggd3.aesmapping( {aes: "x", field: "myField"} );
			expect(aesmapping.aes()).toEqual("x");
			expect(aesmapping.field()).toEqual("myField");
		});

		it("should initialise aesmapping with scale", function() {
			var aesmapping = ggd3.aesmapping( {aes: "col", field: "myField", scale: "colorScale"} );
			expect(aesmapping.scale()).toEqual("colorScale");
		});

	});

});