ggjs.Axis = (function() {
    var axis = function(spec) {
        spec = spec || {};
        if (ggjs.util.isUndefined(spec.type)) throw new Error("The axis type must be defined");
        this.axis = {
            type: spec.type,
            scaleName: spec.scaleName || null
        };
        //if (s) ggjs.extend(this.axis, s);
    };

    var prototype = axis.prototype;

    prototype.type = function (val) {
        if (!arguments.length) return this.axis.type;
        this.axis.type = val;
        return this;
    };

    prototype.scaleName = function(val) {
        if (!arguments.length) return this.axis.scaleName;
        // ToDo: set as object, ggjs scale (or either)?
        this.axis.scaleName = val;
        return this;
    };

    return axis;
})();

ggjs.axis = function (s) {
    return new ggjs.Axis(s);
};