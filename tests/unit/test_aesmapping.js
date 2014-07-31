describe("Module: ggd3.AesMapping", function() {
	
	describe("aesmapping initialisation", function() {

		it("should initialise left aesmapping", function() {
			var aesmapping = ggd3.aesmapping( {aes: "x", field: "myField"} );
			expect(aesmapping.aes()).toEqual("x");
			expect(aesmapping.field()).toEqual("myField");
		});

	});

});