define(['../../lib/d3.js', 'ggjs'], function(d3, ggjs) {
	describe("Module: ggjs.util.array", function() {
		var arrayUtil = ggjs.util.array;

		describe("indexOf", function() {
			it("should find string in array", function() {
				expect(arrayUtil.indexOf(["a", "b", "c"], "b")).toEqual(1);
			});
			it("should find string in first position of array", function() {
				expect(arrayUtil.indexOf(["a"], "a")).toEqual(0);
			});
			it("should not find string in number array", function() {
				expect(arrayUtil.indexOf([1, 2, 3], "blah")).toEqual(-1);
			});
			it("should not find string in empty array", function() {
				expect(arrayUtil.indexOf([], "blah")).toEqual(-1);
			});

			it("should find number in array", function() {
				expect(arrayUtil.indexOf([1, 2, 3], 2)).toEqual(1);
			});
			it("should find number in first position of array", function() {
				expect(arrayUtil.indexOf([1], 1)).toEqual(0);
			});
			it("should not find number in string array", function() {
				expect(arrayUtil.indexOf(["a", "b", "c"], 1)).toEqual(-1);
			});
			it("should not find number in empty array", function() {
				expect(arrayUtil.indexOf([], 1)).toEqual(-1);
			});

		});

		describe("contains", function() {
			it("should find string in array", function() {
				expect(arrayUtil.contains(["a", "b", "c"], "b")).toBe(true);
			});
			it("should find string in 1 element array", function() {
				expect(arrayUtil.contains(["a"], "a")).toBe(true);
			});
			it("should not find string in number array", function() {
				expect(arrayUtil.contains([1, 2, 3], "blah")).toBe(false);
			});
			it("should not find string in empty array", function() {
				expect(arrayUtil.contains([], "blah")).toBe(false);
			});

			it("should find number in array", function() {
				expect(arrayUtil.contains([1, 2, 3], 2)).toBe(true);
			});
			it("should find number in 1 element array", function() {
				expect(arrayUtil.contains([1], 1)).toBe(true);
			});
			it("should not find number in string array", function() {
				expect(arrayUtil.contains(["a", "b", "c"], 1)).toBe(false);
			});
			it("should not find number in empty array", function() {
				expect(arrayUtil.contains([], 1)).toBe(false);
			});

		});
	});
});