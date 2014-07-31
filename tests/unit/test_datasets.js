describe("Module: ggd3.Data", function() {
	
	describe("datasets initialisation", function() {
		it("should initialise the datasets with one dataset", function() {
			var datasets = ggd3.datasets( [{name: "myDataset"}] );
			expect(datasets.count()).toEqual(1);
			expect(datasets.dataset("myDataset").name()).toEqual("myDataset");
		});

		it("should initialise the datasets with two datasets", function() {
			var datasets = ggd3.datasets( [{name: "dataset1"}, {name: "dataset2"}] );
			expect(datasets.count()).toEqual(2);
			expect(datasets.dataset("dataset1").name()).toEqual("dataset1");
			expect(datasets.dataset("dataset2").name()).toEqual("dataset2");
		});
	});
});