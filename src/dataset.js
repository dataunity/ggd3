ggjs.Dataset = (function() {
    var dataset = function(spec) {
        spec = spec || {};
        if (ggjs.util.isUndefined(spec.name)) throw new Error("The dataset name must be defined");
        this.dataset = {
            name: spec.name,
            values: spec.values || null,
            url: spec.url || null,
            contentType: spec.contentType || null,
            dataTypes: spec.dataTypes || {}
        };
        //if (s) ggjs.extend(this.dataset, s);
    };

    var prototype = dataset.prototype;

    prototype.name = function (val) {
        if (!arguments.length) return this.dataset.name;
        this.dataset.name = val;
        return this;
    };

    prototype.values = function(val) {
        // Note: values should be JSON style data, e.g:
        // [{"a": 1, "b": 1}, {"a": 2, "b": 2}]
        if (!arguments.length) return this.dataset.values;
        this.dataset.values = val;
        return this;
    };

    prototype.url = function (val) {
        if (!arguments.length) return this.dataset.url;
        this.dataset.url = val;
        return this;
    };

    prototype.contentType = function (val) {
        if (!arguments.length) return this.dataset.contentType;
        this.dataset.contentType = val;
        return this;
    };

    prototype.dataTypes = function (val) {
        if (!arguments.length) return this.dataset.dataTypes;
        this.dataset.dataTypes = val;
        return this;
    };

    prototype.applyDataTypesToValues = function (dataTypes, values) {
        // Applies the user supplied data types
        // to values in dataset
        var isUndefined = ggjs.util.isUndefined,
            toBoolean = ggjs.util.toBoolean,
            fieldName, dataType, i, val;

        if (!values) {
            return;
        }

        for (fieldName in dataTypes) {
            dataType = dataTypes[fieldName];
            switch (dataType) {
                case "number":
                    for (i = 0; i < values.length; i++) {
                        val = values[i][fieldName];
                        if (!isUndefined(val)) {
                            values[i][fieldName] = +val;
                        }
                    }
                    break;
                case "boolean":
                    for (i = 0; i < values.length; i++) {
                        val = values[i][fieldName];
                        if (!isUndefined(val)) {
                            values[i][fieldName] = toBoolean(val);
                        }
                    }
                    break;
                case "date":
                    for (i = 0; i < values.length; i++) {
                        val = values[i][fieldName];
                        console.log("Val before:", val);
                        if (!isUndefined(val)) {
                            values[i][fieldName] = new Date(val);
                        }
                        console.log("Val after:", typeof values[i][fieldName], values[i][fieldName]);
                    }
                    break;
                default:
                    throw new Error("Can't apply data type, unrecognised data type " + dataType);
            }
        }
    };

    prototype.applyDataTypes = function () {
        var dataTypes = this.dataTypes(),
            values = this.values();
        this.applyDataTypesToValues(dataTypes, values);
    };

    return dataset;
})();

ggjs.dataset = function (s) {
    return new ggjs.Dataset(s);
};
