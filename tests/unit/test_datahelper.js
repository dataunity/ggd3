describe("Module: ggd3.dataHelper", function() {
	
	describe("isUndefined", function() {
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
});