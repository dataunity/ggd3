describe("Module: ggd3.Plot", function() {
	
	// -----------------------
	// Plot initialisations
	// -----------------------
	describe("plot initialisation", function() {
		it("should initialise the plot width", function() {
			var plot = ggd3.plot( {width: 200} );
			expect(plot.width()).toEqual(200);
		});

		it("should initialise the plot height", function() {
			var plot = ggd3.plot( {height: 250} );
			expect(plot.height()).toEqual(250);
		});

		it("should initialise the plot left padding", function() {
			var plot = ggd3.plot( {padding: {left: 999}} );
			expect(plot.padding().left()).toEqual(999);
		});

		it("should initialise the plot right padding", function() {
			var plot = ggd3.plot( {padding: {right: 999}} );
			expect(plot.padding().right()).toEqual(999);
		});

		it("should initialise the plot top padding", function() {
			var plot = ggd3.plot( {padding: {top: 999}} );
			expect(plot.padding().top()).toEqual(999);
		});

		it("should initialise the plot bottom padding", function() {
			var plot = ggd3.plot( {padding: {bottom: 999}} );
			expect(plot.padding().bottom()).toEqual(999);
		});

		it("should initialise the plot with default padding", function() {
			var plot = ggd3.plot({});
			expect(plot.padding().top()).toEqual(20);
			expect(plot.padding().bottom()).toEqual(20);
			expect(plot.padding().left()).toEqual(20);
			expect(plot.padding().right()).toEqual(20);
		});

		it("should initialise the plot with coordinate system", function() {
			var plot = ggd3.plot({"coord": "polar"});
			expect(plot.coord()).toEqual("polar");
		});

		it("should initialise the plot with default coordinate system", function() {
			var plot = ggd3.plot({});
			expect(plot.coord()).toEqual("cartesian");
		});

		it("should initialise the plot with a data", function() {
			var plot = ggd3.plot({
				data: [
					{
						name: "myData"
					}
				]
			});
			expect(plot.data().count()).toEqual(1);
			expect(plot.data().dataset("myData").name()).toEqual("myData");
		});

		it("should initialise the plot with a axis", function() {
			var plot = ggd3.plot({
				axes: [
					{type: "x1"}
				]
			});
			expect(plot.axes().count()).toEqual(1);
			expect(plot.axes().axis("x1").type()).toEqual("x1");
		});

		it("should initialise the plot with a scale", function() {
			var plot = ggd3.plot({
				scales: [
					{
						name: "myScale",
						type: "pow"
					}
				]
			});
			expect(plot.scales().count()).toEqual(1);
			expect(plot.scales().scale("myScale").type()).toEqual("pow");
		});

		it("should initialise the plot with a layer", function() {
			var plot = ggd3.plot({
				layers: [
					{
						geom: "text"
					}
				]
			});
			expect(plot.layers().count()).toEqual(1);
			expect(plot.layers().asArray()[0].geom()).toEqual("text");
		});
	});

	// -----------------------
	// Plot area
	// -----------------------
	describe("plot area", function() {
		it("should get the plot area width", function() {
			var plot = ggd3.plot({
				width: 600,
				padding: {
					left: 40,
					right: 50
				}
			});
			expect(plot.plotAreaWidth()).toEqual(510);
		});

		it("should get the plot area height", function() {
			var plot = ggd3.plot({
				height: 400,
				padding: {
					top: 20,
					bottom: 30
				}
			});
			expect(plot.plotAreaHeight()).toEqual(350);
		});

		it("should get the plot area x position", function() {
			var plot = ggd3.plot({
				width: 600,
				padding: {
					left: 40,
					right: 50
				}
			});
			expect(plot.plotAreaX()).toEqual(40);
		});

		it("should get the plot area y position", function() {
			var plot = ggd3.plot({
				height: 400,
				padding: {
					top: 20,
					bottom: 30
				}
			});
			expect(plot.plotAreaY()).toEqual(20);
		});
	});

	// -----------------------
	// Data
	// -----------------------
	describe("plot data", function() {
		it("should get the name of default dataset", function() {
			var plot = ggd3.plot({
				data: [{name: "myData"}]
			});
			expect(plot.defaultDatasetName()).toEqual("myData");
		});
	});
});