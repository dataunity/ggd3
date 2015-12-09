define(['ggjs'], function(ggjs) {
	describe("Module: ggjs.Plot", function() {
		
		// -----------------------
		// Plot initialisations
		// -----------------------
		describe("plot initialisation", function() {
			it("should initialise the plot width", function() {
				var plot = ggjs.plot( {width: 200} );
				expect(plot.width()).toEqual(200);
			});

			it("should initialise the plot height", function() {
				var plot = ggjs.plot( {height: 250} );
				expect(plot.height()).toEqual(250);
			});

			it("should initialise the plot left padding", function() {
				var plot = ggjs.plot( {padding: {left: 999}} );
				expect(plot.padding().left()).toEqual(999);
			});

			it("should initialise the plot right padding", function() {
				var plot = ggjs.plot( {padding: {right: 999}} );
				expect(plot.padding().right()).toEqual(999);
			});

			it("should initialise the plot top padding", function() {
				var plot = ggjs.plot( {padding: {top: 999}} );
				expect(plot.padding().top()).toEqual(999);
			});

			it("should initialise the plot bottom padding", function() {
				var plot = ggjs.plot( {padding: {bottom: 999}} );
				expect(plot.padding().bottom()).toEqual(999);
			});

			it("should initialise the plot with default padding", function() {
				var plot = ggjs.plot({});
				expect(plot.padding().top()).toEqual(20);
				expect(plot.padding().bottom()).toEqual(70);
				expect(plot.padding().left()).toEqual(40);
				expect(plot.padding().right()).toEqual(20);
			});

			it("should initialise the plot with coordinate system", function() {
				var plot = ggjs.plot({"coord": "polar"});
				expect(plot.coord()).toEqual("polar");
			});

			it("should initialise the plot with default coordinate system", function() {
				var plot = ggjs.plot({});
				expect(plot.coord()).toEqual("cartesian");
			});

			it("should initialise the plot with a data", function() {
				var plot = ggjs.plot({
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
				var plot = ggjs.plot({
					axes: [
						{type: "x1"}
					]
				});
				expect(plot.axes().count()).toEqual(1);
				expect(plot.axes().axis("x1").type()).toEqual("x1");
			});

			it("should initialise the plot with a Linked Data axis", function() {
				// It's easier to represent the axis collection as an array
				// called axis rather than axes when using Linked Data.
				var plot = ggjs.plot({
					axis: [
						{type: "x1"}
					]
				});
				expect(plot.axes().count()).toEqual(1);
				expect(plot.axes().axis("x1").type()).toEqual("x1");
			});

			it("should initialise the plot with a scale", function() {
				var plot = ggjs.plot({
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

			it("should initialise the plot with a Linked Data scale", function() {
				// It's easier to represent the scale collection as an array
				// called 'scale' rather than 'scales' when using Linked Data.
				var plot = ggjs.plot({
					scale: [
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
				var plot = ggjs.plot({
					layers: [
						{
							geom: {geomType: "text"}
						}
					]
				});
				expect(plot.layers().count()).toEqual(1);
				expect(plot.layers().asArray()[0].geom().geomType()).toEqual("text");
			});
		});

		// -----------------------
		// Plot area
		// -----------------------
		describe("plot area", function() {
			it("should get the plot area width", function() {
				var plot = ggjs.plot({
					width: 600,
					padding: {
						left: 40,
						right: 50
					}
				});
				expect(plot.plotAreaWidth()).toEqual(510);
			});

			it("should get the plot area height", function() {
				var plot = ggjs.plot({
					height: 400,
					padding: {
						top: 20,
						bottom: 30
					}
				});
				expect(plot.plotAreaHeight()).toEqual(350);
			});

			it("should get the plot area x position", function() {
				var plot = ggjs.plot({
					width: 600,
					padding: {
						left: 40,
						right: 50
					}
				});
				expect(plot.plotAreaX()).toEqual(40);
			});

			it("should get the plot area y position", function() {
				var plot = ggjs.plot({
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
		// Axis info
		// -----------------------
		describe("plot axis info", function() {
			it("should get the y axis height for cartesian coords", function() {
				var plot = ggjs.plot({
					"coord": "cartesian",
					height: 400,
					padding: {
						top: 60,
						bottom: 40
					}
				});
				expect(plot.yAxisHeight()).toEqual(300);
			});

			it("should get the y axis height for polar coords", function() {
				var plot = ggjs.plot({
					"coord": "polar",
					height: 400,
					padding: {
						top: 60,
						bottom: 40
					}
				});
				expect(plot.yAxisHeight()).toEqual(150);
			});
		});

		// -----------------------
		// Data
		// -----------------------
		describe("plot data", function() {
			it("should get the name of default dataset", function() {
				var plot = ggjs.plot({
					data: [{name: "myData"}]
				});
				expect(plot.defaultDatasetName()).toEqual("myData");
			});
		});
	});
});