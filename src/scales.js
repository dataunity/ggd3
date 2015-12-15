ggjs.Scale = (function () {
    var scale = function(spec) {
        this.scale = {
            type: spec.type || null,
            name: spec.name || null,
            domain: spec.domain || null,
            range: spec.range || null
        };
        //if (spec) ggjs.extend(this.scale, spec);
    };

    var prototype = scale.prototype;

    prototype.type = function(val) {
        if (!arguments.length) return this.scale.type;
        this.scale.type = val;
        return this;
    };

    prototype.name = function(val) {
        if (!arguments.length) return this.scale.name;
        this.scale.name = val;
        return this;
    };

    prototype.domain = function(val) {
        if (!arguments.length) return this.scale.domain;
        this.scale.domain = val;
        return this;
    };

    prototype.range = function(val) {
        if (!arguments.length) return this.scale.range;
        this.scale.range = val;
        return this;
    };

    prototype.hasDomain = function () {
        // Whether a domain is specified for the scale
        // Read only
        return this.domain() !== null;
    };

    prototype.hasRange = function () {
        // Whether a range is specified for the scale
        // Read only
        return this.range() !== null;
    };

    prototype.isQuantitative = function () {
        var quantScales = ["linear", "sqrt", "pow", "log"];
        return ggjs.util.array.contains(quantScales, this.type());
    };

    prototype.isOrdinal = function () {
        var ordinalScales = ["ordinal", "category10", "category20", "category20b", "category20c"];
        return ggjs.util.array.contains(ordinalScales, this.type());
    };

    prototype.isTime = function () {
        var timeScales = ["time"];
        return ggjs.util.array.contains(timeScales, this.type());
    };

    return scale;
})();

ggjs.scale = function (s) {
    return new ggjs.Scale(s);
};

ggjs.Scales = (function() {
    var scales = function(s) {
        var i, scale;
        this.scales = {};
        if (s) {
            for (i = 0; i < s.length; i++) {
                scale = ggjs.scale(s[i]);
                this.scales[scale.name()] = scale;
            }
        }
    };

    var prototype = scales.prototype;

    prototype.scale = function(scaleName, scale) {
        // Gets or set scale by name
        if (arguments.length < 1) throw new Error("scale function needs scaleName argument.");
        if (arguments.length == 1) return this.scales[scaleName];
        this.scales[scaleName] = ggjs.scale(scale);
        return this;
    };

    prototype.count = function() {
        var size = 0, key;
        for (key in this.scales) {
            if (this.scales.hasOwnProperty(key)) size++;
        }
        return size;
    };

    return scales;
})();

ggjs.scales = function (s) {
    return new ggjs.Scales(s);
};
