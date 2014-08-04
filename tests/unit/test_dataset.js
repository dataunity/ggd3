describe("Module: ggd3.Dataset", function() {
	
	// ---------------
	// Initialisation
	// ---------------
	describe("dataset initialisation", function() {
		it("should initialise the dataset with name", function() {
			var dataset = ggd3.dataset( {name: "x1"} );
			expect(dataset.name()).toEqual("x1");
		});

		it("should error if no dataset name", function() {
			expect(function () { ggd3.dataset({}); }).toThrow(new Error("The dataset name must be defined"));
		});

		it("should initialise the dataset with values", function() {
			var dataset = ggd3.dataset({
				name: "x1", 
				values: [
					{"x": 1, "y": 100}, 
					{"x": 2, "y": 200} ]
			});
			expect(dataset.values().length).toEqual(2);
			expect(dataset.values()[0]).toEqual({"x": 1, "y": 100});
			expect(dataset.values()[1]).toEqual({"x": 2, "y": 200});
		});

		it("should initialise the dataset with url", function() {
			var dataset = ggd3.dataset( {name: "x1", url: "http://example.com"} );
			expect(dataset.url()).toEqual("http://example.com");
		});

		it("should initialise the dataset with content type", function() {
			var dataset = ggd3.dataset( {name: "x1", contentType: "text/tab-separated-values"} );
			expect(dataset.contentType()).toEqual("text/tab-separated-values");
		});
	});

	// ---------------
	// Values
	// ---------------
	describe("dataset values", function() {
		it("should set the dataset values", function() {
			var dataset = ggd3.dataset( {name: "x1"} );
			dataset.values([
				{"x": 1, "y": 100}, 
				{"x": 2, "y": 200}
			]);
			expect(dataset.values().length).toEqual(2);
			expect(dataset.values()[0]).toEqual({"x": 1, "y": 100});
			expect(dataset.values()[1]).toEqual({"x": 2, "y": 200});
		});

	});
});