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

	describe("deepCopy", function() {
		it("should make a deep copy of a simple object", function() {
			var obj1 = {"a": 1},
				obj2 = {"a": "b"},
				objCopy1 = ggd3.util.deepCopy(obj1),
				objCopy2 = ggd3.util.deepCopy(obj2);
			expect(objCopy1).toEqual({"a": 1});
			expect(objCopy2).toEqual({"a": "b"});

			// Check changes to original don't change the deep copy
			obj1 = {"a": 100},
			obj2 = {"a": "bbbb"};
			expect(objCopy1).toEqual({"a": 1});
			expect(objCopy2).toEqual({"a": "b"});
		});

		it("should make a deep copy of an array of simple objects", function() {
			var arr = [{"a": 1}, {"b": 2}],
				arrCopy = ggd3.util.deepCopy(arr);
			expect(arrCopy).toEqual([{"a": 1}, {"b": 2}]);

			// Check changes to original don't change the deep copy
			arr.push({"a": 100});
			expect(arrCopy).toEqual([{"a": 1}, {"b": 2}]);
		});
	});

	describe("toBoolean", function() {
		it("should recognise true cases", function() {
			expect(ggd3.util.toBoolean(true)).toBe(true);
			expect(ggd3.util.toBoolean(1)).toBe(true);
			expect(ggd3.util.toBoolean("true")).toBe(true);
			expect(ggd3.util.toBoolean("True")).toBe(true);
			expect(ggd3.util.toBoolean("TRUE")).toBe(true);
			expect(ggd3.util.toBoolean("yes")).toBe(true);
			expect(ggd3.util.toBoolean("Yes")).toBe(true);
			expect(ggd3.util.toBoolean("YES")).toBe(true);
			expect(ggd3.util.toBoolean("1")).toBe(true);
		});

		it("should recognise false cases", function() {
			expect(ggd3.util.toBoolean(undefined)).toBe(false);
			expect(ggd3.util.toBoolean(null)).toBe(false);
			expect(ggd3.util.toBoolean(0)).toBe(false);
			expect(ggd3.util.toBoolean(false)).toBe(false);
			expect(ggd3.util.toBoolean("false")).toBe(false);
			expect(ggd3.util.toBoolean("False")).toBe(false);
			expect(ggd3.util.toBoolean("FALSE")).toBe(false);
			expect(ggd3.util.toBoolean("no")).toBe(false);
			expect(ggd3.util.toBoolean("No")).toBe(false);
			expect(ggd3.util.toBoolean("NO")).toBe(false);
			expect(ggd3.util.toBoolean("0")).toBe(false);
		});

	});
});