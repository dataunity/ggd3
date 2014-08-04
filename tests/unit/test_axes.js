describe("Module: ggd3.Axes", function() {
	
	describe("axes initialisation", function() {
		it("should initialise the axes with one axis", function() {
			var axes = ggd3.axes( [{type: "x1"}] );
			expect(axes.count()).toEqual(1);
			expect(axes.axis("x1").type()).toEqual("x1");
		});

		it("should initialise the axes with two axes", function() {
			var axes = ggd3.axes( [{type: "x1"}, {type: "y1"}] );
			expect(axes.count()).toEqual(2);
			expect(axes.axis("x1").type()).toEqual("x1");
			expect(axes.axis("y1").type()).toEqual("y1");
		});
	});
});