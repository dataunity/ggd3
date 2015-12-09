define(['ggjs'], function(ggjs) {
	describe("Module: ggjs.AesMapping", function() {
		
		describe("aesmapping initialisation", function() {

			it("should initialise aesmapping", function() {
				var aesmapping = ggjs.aesmapping( {aes: "x", field: "myField"} );
				expect(aesmapping.aes()).toEqual("x");
				expect(aesmapping.field()).toEqual("myField");
			});

			it("should initialise aesmapping with scale", function() {
				var aesmapping = ggjs.aesmapping( {aes: "col", field: "myField", scaleName: "colorScale"} );
				expect(aesmapping.scaleName()).toEqual("colorScale");
			});

		});

	});
});