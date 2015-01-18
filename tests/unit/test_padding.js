describe("Module: ggjs.Padding", function() {
	
	describe("padding initialisation", function() {

		it("should initialise left padding", function() {
			var padding = ggjs.padding( {left: 999} );
			expect(padding.left()).toEqual(999);
		});

		it("should initialise right padding", function() {
			var padding = ggjs.padding( {right: 999} );
			expect(padding.right()).toEqual(999);
		});

		it("should initialise top padding", function() {
			var padding = ggjs.padding( {top: 999} );
			expect(padding.top()).toEqual(999);
		});

		it("should initialise bottom padding", function() {
			var padding = ggjs.padding( {bottom: 999} );
			expect(padding.bottom()).toEqual(999);
		});

		it("should initialise default padding", function() {
			var padding = ggjs.padding({});
			expect(padding.top()).toEqual(20);
			expect(padding.bottom()).toEqual(30);
			expect(padding.left()).toEqual(40);
			expect(padding.right()).toEqual(20);
		});

	});

});