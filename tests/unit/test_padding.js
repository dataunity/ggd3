describe("Module: ggd3.Padding", function() {
	
	describe("padding initialisation", function() {

		it("should initialise left padding", function() {
			var padding = ggd3.padding( {left: 999} );
			expect(padding.left()).toEqual(999);
		});

		it("should initialise right padding", function() {
			var padding = ggd3.padding( {right: 999} );
			expect(padding.right()).toEqual(999);
		});

		it("should initialise top padding", function() {
			var padding = ggd3.padding( {top: 999} );
			expect(padding.top()).toEqual(999);
		});

		it("should initialise bottom padding", function() {
			var padding = ggd3.padding( {bottom: 999} );
			expect(padding.bottom()).toEqual(999);
		});

		it("should initialise default padding", function() {
			var padding = ggd3.padding({});
			expect(padding.top()).toEqual(20);
			expect(padding.bottom()).toEqual(20);
			expect(padding.left()).toEqual(20);
			expect(padding.right()).toEqual(20);
		});

	});

});