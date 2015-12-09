define(['ggjs'], function(ggjs) {
	describe("Module: ggjs.util", function() {
		
		describe("isUndefined", function() {
			it("should recognised undefined as undefined", function() {
				expect(ggjs.util.isUndefined(undefined)).toBe(true);
			});

			it("should not recognised object as undefined", function() {
				expect(ggjs.util.isUndefined({})).toBe(false);
			});

			it("should not recognised int as undefined", function() {
				expect(ggjs.util.isUndefined(5)).toBe(false);
			});

			it("should not recognised empty string as undefined", function() {
				expect(ggjs.util.isUndefined("")).toBe(false);
			});
		});

		describe("isArray", function () {
			it("should identify array", function () {
				expect(ggjs.util.isArray([])).toBe(true);
			});
		});

		describe("isPlainObject", function() {
			it("should identify plain object", function() {
				expect(ggjs.util.isPlainObject({})).toEqual(true);
			});
		});

		describe("objKeys", function() {
			it("should find keys in obj", function() {
				expect(ggjs.util.objKeys({})).toEqual([]);
				expect(ggjs.util.objKeys({"a": "a", "b": "b"}).sort()).toEqual(["a", "b"]);
			});
		});

		describe("countObjKeys", function() {
			it("should find number of keys in obj", function() {
				expect(ggjs.util.countObjKeys({})).toEqual(0);
				expect(ggjs.util.countObjKeys({"a": "a", "b": "b"})).toEqual(2);
			});

		});

		describe("deepCopy", function() {
			it("should make a deep copy of a simple object", function() {
				var obj1 = {"a": 1},
					obj2 = {"a": "b"},
					objCopy1 = ggjs.util.deepCopy(obj1),
					objCopy2 = ggjs.util.deepCopy(obj2);
				expect(objCopy1).toEqual({"a": 1});
				expect(objCopy2).toEqual({"a": "b"});

				// Check changes to original don't change the deep copy
				obj1 = {"a": 100};
				obj2 = {"a": "bbbb"};
				expect(objCopy1).toEqual({"a": 1});
				expect(objCopy2).toEqual({"a": "b"});
			});

			it("should make a deep copy of an array of simple objects", function() {
				var arr = [{"a": 1}, {"b": 2}],
					arrCopy = ggjs.util.deepCopy(arr);
				expect(arrCopy).toEqual([{"a": 1}, {"b": 2}]);

				// Check changes to original don't change the deep copy
				arr.push({"a": 100});
				expect(arrCopy).toEqual([{"a": 1}, {"b": 2}]);
			});

			it("should preserve date type on deep copy", function() {
				var arr = [{"a": new Date(2015, 0, 1)}, {"b": new Date(2020, 0, 1)}],
					arrCopy = ggjs.util.deepCopy(arr);
				expect(arrCopy).toEqual([{"a": new Date(2015, 0, 1)}, {"b": new Date(2020, 0, 1)}]);

				// Check changes to original don't change the deep copy
				arr.push({"c": 100});
				arr[0].a = new Date(2010, 11, 31);
				expect(arrCopy).toEqual([{"a": new Date(2015, 0, 1)}, {"b": new Date(2020, 0, 1)}]);
			});
		});

		describe("toBoolean", function() {
			it("should recognise true cases", function() {
				expect(ggjs.util.toBoolean(true)).toBe(true);
				expect(ggjs.util.toBoolean(1)).toBe(true);
				expect(ggjs.util.toBoolean("true")).toBe(true);
				expect(ggjs.util.toBoolean("True")).toBe(true);
				expect(ggjs.util.toBoolean("TRUE")).toBe(true);
				expect(ggjs.util.toBoolean("yes")).toBe(true);
				expect(ggjs.util.toBoolean("Yes")).toBe(true);
				expect(ggjs.util.toBoolean("YES")).toBe(true);
				expect(ggjs.util.toBoolean("1")).toBe(true);
			});

			it("should recognise false cases", function() {
				expect(ggjs.util.toBoolean(undefined)).toBe(false);
				expect(ggjs.util.toBoolean(null)).toBe(false);
				expect(ggjs.util.toBoolean(0)).toBe(false);
				expect(ggjs.util.toBoolean(false)).toBe(false);
				expect(ggjs.util.toBoolean("false")).toBe(false);
				expect(ggjs.util.toBoolean("False")).toBe(false);
				expect(ggjs.util.toBoolean("FALSE")).toBe(false);
				expect(ggjs.util.toBoolean("no")).toBe(false);
				expect(ggjs.util.toBoolean("No")).toBe(false);
				expect(ggjs.util.toBoolean("NO")).toBe(false);
				expect(ggjs.util.toBoolean("0")).toBe(false);
			});

		});
	});
});