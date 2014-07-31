describe("Module: ggd3.Dataset", function() {
	
	describe("dataset initialisation", function() {
		it("should initialise the dataset with name", function() {
			var dataset = ggd3.dataset( {name: "x1"} );
			expect(dataset.name()).toEqual("x1");
		});

		it("should error if no dataset name", function() {
			expect(function () { ggd3.dataset({}); }).toThrow(new Error("The dataset name must be defined"));
		});

		// it("should initialise the dataset with values", function() {
		// 	var dataset = ggd3.dataset({
		// 		name: "x"
		// 	});
		// 	expect(dataset.scale()).toEqual("xScale");
		// });
	});
});