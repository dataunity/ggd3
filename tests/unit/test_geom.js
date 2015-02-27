describe("Module: ggjs.Geom", function() {
	
	describe("geom initialisation", function() {

		it("should initialise geom type", function() {
			var geom = ggjs.geom( {geomType: "GeomText"} );
			expect(geom.geomType()).toEqual("GeomText");
		});

		it("should initialise default geom", function() {
			var geom = ggjs.geom({});
			expect(geom.geomType()).toEqual("GeomBar");
		});

	});

});