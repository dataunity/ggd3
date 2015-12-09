describe("Module: ggjs.Datasets", function() {
	
	it("should initialise the datasets with one dataset", function() {
		var datasets = ggjs.datasets( [{name: "myDataset"}] );
		expect(datasets.count()).toEqual(1);
		expect(datasets.dataset("myDataset").name()).toEqual("myDataset");
	});

	it("should initialise the datasets with two datasets", function() {
		var datasets = ggjs.datasets( [{name: "dataset1"}, {name: "dataset2"}] );
		expect(datasets.count()).toEqual(2);
		expect(datasets.dataset("dataset1").name()).toEqual("dataset1");
		expect(datasets.dataset("dataset2").name()).toEqual("dataset2");
	});

	it("should find the names of datasets", function() {
		var datasets = ggjs.datasets( [{name: "dataset1"}, {name: "dataset2"}] );
		expect(datasets.names().sort()).toEqual(["dataset1", "dataset2"]);
	});
});