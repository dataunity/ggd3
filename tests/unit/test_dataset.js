describe("Module: ggjs.Dataset", function() {
	
	// ---------------
	// Initialisation
	// ---------------
	describe("dataset initialisation", function() {
		it("should initialise the dataset with name", function() {
			var dataset = ggjs.dataset( {name: "x1"} );
			expect(dataset.name()).toEqual("x1");
		});

		it("should error if no dataset name", function() {
			expect(function () { ggjs.dataset({}); }).toThrow(new Error("The dataset name must be defined"));
		});

		it("should initialise the dataset with values", function() {
			var dataset = ggjs.dataset({
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
			var dataset = ggjs.dataset( {name: "x1", url: "http://example.com"} );
			expect(dataset.url()).toEqual("http://example.com");
		});

		it("should initialise the dataset with content type", function() {
			var dataset = ggjs.dataset( {name: "x1", contentType: "text/tab-separated-values"} );
			expect(dataset.contentType()).toEqual("text/tab-separated-values");
		});

		it("should initialise the dataset with column data types", function() {
			var dataset = ggjs.dataset( {name: "x1", dataTypes: {"columnA": "number", "columnB": "boolean"}} );
			expect(dataset.dataTypes()["columnA"]).toEqual("number");
			expect(dataset.dataTypes()["columnB"]).toEqual("boolean");
		});
	});

	// ---------------
	// Values
	// ---------------
	describe("dataset values", function() {
		it("should set the dataset values", function() {
			var dataset = ggjs.dataset( {name: "x1"} );
			dataset.values([
				{"x": 1, "y": 100}, 
				{"x": 2, "y": 200}
			]);
			expect(dataset.values().length).toEqual(2);
			expect(dataset.values()[0]).toEqual({"x": 1, "y": 100});
			expect(dataset.values()[1]).toEqual({"x": 2, "y": 200});
		});

	});

	// ---------------
	// Data types
	// ---------------
	describe("dataset data types", function() {
		it("should apply data type coercion to dataset values", function() {
			var dataset = ggjs.dataset({
				name: "x1", 
				dataTypes: {"y": "number", "isAThing": "boolean"},
				values: [
					{"x": 1, "y": "100", "isAThing": "true"}, 
					{"x": 2, "y": "200", "isAThing": "false"} ]
			});
			dataset.applyDataTypes();
			expect(dataset.values()[0]["y"]).toEqual(100);
			expect(dataset.values()[1]["y"]).toEqual(200);
			expect(dataset.values()[0]["isAThing"]).toBe(true);
			expect(dataset.values()[1]["isAThing"]).toBe(false);
		});

		it("should apply data type coercion to date", function() {
			var dataset = ggjs.dataset({
				name: "x1", 
				dataTypes: {"x": "date"},
				values: [
					{"x": "2015-01-01"}, 
					{"x": "2015-01-31"} ]
			});
			dataset.applyDataTypes();
			expect(dataset.values()[0]["x"]).toEqual(new DateTime(2015, 0, 1));
			expect(dataset.values()[1]["x"]).toEqual(new DateTime(2015, 0, 31));
		});

	});
});