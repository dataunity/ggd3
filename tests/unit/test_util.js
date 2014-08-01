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

	describe("objKeys", function() {
		it("should find keys in obj", function() {
			expect(ggd3.util.objKeys({})).toEqual([]);
			expect(ggd3.util.objKeys({"a": "a", "b": "b"}).sort()).toEqual(["a", "b"]);
		});

	});

	describe("countObjKeys", function() {
		it("should find number of keys in obj", function() {
			expect(ggd3.util.countObjKeys({})).toEqual(0);
			expect(ggd3.util.countObjKeys({"a": "a", "b": "b"})).toEqual(2);
		});

	});
});