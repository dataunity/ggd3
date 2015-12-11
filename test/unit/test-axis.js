define(['../../lib/d3.js', 'ggjs'], function(d3, ggjs) {
	describe("Module: ggjs.Axis", function() {
		
		describe("axis initialisation", function() {
			it("should initialise the axis with type", function() {
				var axis = ggjs.axis( {type: "x1"} );
				expect(axis.type()).toEqual("x1");
			});

			it("should error if no axis type", function() {
				expect(function () { ggjs.axis({}); }).toThrow(new Error("The axis type must be defined"));
			});

			it("should initialise the axis with scale", function() {
				var axis = ggjs.axis({
					type: "x1",
					scaleName: "xScale"
				});
				expect(axis.scaleName()).toEqual("xScale");
			});
		});
	});
});