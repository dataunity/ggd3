describe("Module: ggd3.Axis", function() {
	
	describe("axis initialisation", function() {
		it("should initialise the axis with type", function() {
			var axis = ggd3.axis( {type: "x1"} );
			expect(axis.type()).toEqual("x1");
		});

		it("should error if no axis type", function() {
			expect(function () { ggd3.axis({}); }).toThrow(new Error("The axis type must be defined"));
		});

		it("should initialise the axis with scale", function() {
			var axis = ggd3.axis({
				type: "x1",
				scale: "xScale"
			});
			expect(axis.scale()).toEqual("xScale");
		});
	});
});