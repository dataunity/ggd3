describe("Module: ggjs.Scale", function() {
	
	describe("scale initialisation", function() {
		it("should initialise the scale with type", function() {
			var scale = ggjs.scale( {type: "polar"} );
			expect(scale.type()).toEqual("polar");
		});

		it("should initialise the scale with name", function() {
			var scale = ggjs.scale( {name: "myScale"} );
			expect(scale.name()).toEqual("myScale");
		});

		it("should initialise the scale with a domain", function() {
			var scale = ggjs.scale( {domain: [10,20]} );
			expect(scale.domain()).toEqual([10,20]);
		});

		it("should initialise the scale with a range", function() {
			var scale = ggjs.scale( {range: [30,40]} );
			expect(scale.range()).toEqual([30,40]);
		});
	});

	describe("scale type", function() {
		// Quantitative
		it("should recognise linear scale as quantitative", function() {
			var scale = ggjs.scale( {type: "linear"} );
			expect(scale.isQuantitative()).toBe(true);
			expect(scale.isOrdinal()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		it("should recognise sqrt scale as quantitative", function() {
			var scale = ggjs.scale( {type: "sqrt"} );
			expect(scale.isQuantitative()).toBe(true);
			expect(scale.isOrdinal()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		it("should recognise power scale as quantitative", function() {
			var scale = ggjs.scale( {type: "pow"} );
			expect(scale.isQuantitative()).toBe(true);
			expect(scale.isOrdinal()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		it("should recognise log scale as quantitative", function() {
			var scale = ggjs.scale( {type: "log"} );
			expect(scale.isQuantitative()).toBe(true);
			expect(scale.isOrdinal()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		// Ordinal
		it("should recognise ordinal scale as ordinal", function() {
			var scale = ggjs.scale( {type: "ordinal"} );
			expect(scale.isOrdinal()).toBe(true);
			expect(scale.isQuantitative()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		it("should recognise category10 scale as ordinal", function() {
			var scale = ggjs.scale( {type: "category10"} );
			expect(scale.isOrdinal()).toBe(true);
			expect(scale.isQuantitative()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		it("should recognise category20 scale as ordinal", function() {
			var scale = ggjs.scale( {type: "category20"} );
			expect(scale.isOrdinal()).toBe(true);
			expect(scale.isQuantitative()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		it("should recognise category20b scale as ordinal", function() {
			var scale = ggjs.scale( {type: "category20b"} );
			expect(scale.isOrdinal()).toBe(true);
			expect(scale.isQuantitative()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});

		it("should recognise category20c scale as ordinal", function() {
			var scale = ggjs.scale( {type: "category20c"} );
			expect(scale.isOrdinal()).toBe(true);
			expect(scale.isQuantitative()).toBe(false);
			expect(scale.isTime()).toBe(false);
		});


	});

	describe("scale domain", function() {
		it("should indentify whether a scale has a domain", function() {
			var scale = ggjs.scale( {} );
			expect(scale.hasDomain()).toBe(false);
		});

		it("should indentify that a scale has a domain", function() {
			var scale = ggjs.scale( {domain: [2,3]} );
			expect(scale.hasDomain()).toBe(true);
		});

	});

	describe("scale range", function() {
		it("should indentify whether a scale has a range", function() {
			var scale = ggjs.scale( {} );
			expect(scale.hasRange()).toBe(false);
		});

		it("should indentify that a scale has a range", function() {
			var scale = ggjs.scale( {range: [2,3]} );
			expect(scale.hasRange()).toBe(true);
		});

	});
});