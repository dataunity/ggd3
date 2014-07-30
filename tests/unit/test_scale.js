describe("Module: ggd3.Scale", function() {
	
	describe("scale initialisation", function() {
		it("should initialise the scale with type", function() {
			var scale = ggd3.scale( {type: "polar"} );
			expect(scale.type()).toEqual("polar");
		});

		it("should initialise the scale with name", function() {
			var scale = ggd3.scale( {name: "myScale"} );
			expect(scale.name()).toEqual("myScale");
		});
	});
});