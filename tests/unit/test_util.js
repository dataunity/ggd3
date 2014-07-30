describe("Module: ggd3.util", function() {
	
	describe("isUndefined", function() {
		it("should recognised undefined as undefined", function() {
			expect(ggd3.util.isUndefined(undefined)).toBe(true);
		});

		it("should not recognised object as undefined", function() {
			expect(ggd3.util.isUndefined({})).toBe(false);
		});

		it("should not recognised int as undefined", function() {
			expect(ggd3.util.isUndefined(5)).toBe(false);
		});

		it("should not recognised empty string as undefined", function() {
			expect(ggd3.util.isUndefined("")).toBe(false);
		});
	});
});