describe("Module: ggd3.dataHelper", function() {
	var datatable1 = [
			{ "x": 1, "y": 10},
			{ "x": 2, "y": 11},
			{ "x": 3, "y": 12}
		],
		datatable2 = [
			{ "x": 1.1, "y": 10.0},
			{ "x": 2.2, "y": 11.1},
			{ "x": 3.3, "y": 12.2}
		],
		datatableBad = [
			{ "x": null, "y": null},
			{ "x": "", "y": ""},
			{ "x": "-", "y": "-"}
		],
		datatableMissingVals = [
			{ "x": 20 },
			{ "y": 30 }
		],
		goodDatatables = [datatable1, datatable2],
		allDatatables = [datatable1, datatable2, datatableBad, datatableMissingVals],
		dataHelper = ggd3.dataHelper;
	
	describe("datatable stats - max and min", function() {
		
		it("should get datatable field min for x", function() {
			expect(dataHelper.datatableMin(datatable1, "x")).toBe(1);
		});

		it("should get datatable field min for x via stat", function() {
			expect(dataHelper.datatableStat(datatable1, "x", "min")).toBe(1);
		});

		it("should get datatable field min for y", function() {
			expect(dataHelper.datatableMin(datatable1, "y")).toBe(10);
		});

		it("should get datatable field max for x", function() {
			expect(dataHelper.datatableMax(datatable2, "x")).toBe(3.3);
		});

		it("should get datatable field max for y", function() {
			expect(dataHelper.datatableMax(datatable2, "y")).toBe(12.2);
		});

		it("should get datatable field max for y via stat", function() {
			expect(dataHelper.datatableStat(datatable2, "y", "max")).toBe(12.2);
		});

		it("should get datatables field min for x", function() {
			expect(dataHelper.datatablesStat(goodDatatables, "x", "min")).toBe(1);
		});

		it("should get datatables field min for y", function() {
			expect(dataHelper.datatablesStat(goodDatatables, "y", "min")).toBe(10);
		});

		// ToDo: decide if 0 is ok for min value on bad data

		it("should get datatables field max for x", function() {
			expect(dataHelper.datatablesStat(allDatatables, "x", "max")).toBe(20);
		});

		it("should get datatables field max for y", function() {
			expect(dataHelper.datatablesStat(allDatatables, "y", "max")).toBe(30);
		});

		it("should error on invalid stat type", function() {
			expect(function () { dataHelper.datatablesStat(goodDatatables, "y", "blah"); })
				.toThrow(new Error("Can't get datatables stat, unknown stat blah"));
		});

	});

	describe("datatable stats - aggregation", function() {
		
		it("should get datatable field sum for x", function() {
			expect(dataHelper.datatableSum(datatable1, "x")).toBe(6);
		});

		it("should get datatable field sum for x via stat", function() {
			expect(dataHelper.datatableStat(datatable1, "x", "sum")).toBe(6);
		});
	});

	describe("stacked data", function() {
		var dataHelper = ggd3.dataHelper;

		it("should create y baseline field for categorical stacked data", function() {
			var stackedDatatable = [
				{ "x": 1, "y": 1, "fill": "a"},
				{ "x": 2, "y": 2, "fill": "a"},
				{ "x": 3, "y": 3, "fill": "a"},
				{ "x": 1, "y": 4, "fill": "b"},
				{ "x": 2, "y": 5, "fill": "b"},
				{ "x": 3, "y": 6, "fill": "b"},
				{ "x": 1, "y": 7, "fill": "c"},
				{ "x": 2, "y": 8, "fill": "c"},
				{ "x": 3, "y": 9, "fill": "c"}
			];
			stackedData = dataHelper.generateStackYValues(stackedDatatable, "x", "fill", "y");
			expect(stackedData[0]["__y0__"]).toBe(0);
			expect(stackedData[1]["__y0__"]).toBe(0);
			expect(stackedData[2]["__y0__"]).toBe(0);
			expect(stackedData[3]["__y0__"]).toBe(1);
			expect(stackedData[4]["__y0__"]).toBe(2);
			expect(stackedData[5]["__y0__"]).toBe(3);
			expect(stackedData[6]["__y0__"]).toBe(5);
			expect(stackedData[7]["__y0__"]).toBe(7);
			expect(stackedData[8]["__y0__"]).toBe(9);
		});
	});

	describe("stacked data aggregation", function() {
		var dataHelper = ggd3.dataHelper;

		it("should find max value within stacked data", function() {
			var stackedDatatable = [
				{ "x": 1, "y": 1, "fill": "a"},
				{ "x": 2, "y": 2, "fill": "a"},
				{ "x": 3, "y": 3, "fill": "a"},
				{ "x": 1, "y": 4, "fill": "b"},
				{ "x": 2, "y": 5, "fill": "b"},
				{ "x": 3, "y": 6, "fill": "b"},
				{ "x": 1, "y": 7, "fill": "c"},
				{ "x": 2, "y": 8, "fill": "c"},
				{ "x": 3, "y": 9, "fill": "c"}
			];
			var max = dataHelper.maxStackValue(stackedDatatable, "x", "fill", "y");
			expect(max).toBe(18);
		});
	});
});