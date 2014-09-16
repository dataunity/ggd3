describe("Module: ggjs.Scales", function() {
	
	describe("scales initialisation", function() {
		it("should initialise the scales with one scale", function() {
			var scales = ggjs.scales( [{name: "a", type: "pow"}] );
			expect(scales.count()).toEqual(1);
			expect(scales.scale("a").type()).toEqual("pow");
		});

		it("should initialise the scales with two scales", function() {
			var scales = ggjs.scales([
				{name: "a", type: "pow"}, 
				{name: "b", type: "linear"}
			] );
			expect(scales.count()).toEqual(2);
			expect(scales.scale("a").type()).toEqual("pow");
			expect(scales.scale("b").type()).toEqual("linear");
		});
	});
});