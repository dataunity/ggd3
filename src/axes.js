ggjs.Axes = (function() {
    var axes = function(s) {
        var i, axis;
        this.axes = {};
        if (s) {
            for (i = 0; i < s.length; i++) {
                axis = ggjs.axis(s[i]);
                this.axes[axis.type()] = axis;
            }
        }
    };

    var prototype = axes.prototype;

    prototype.axis = function(axisType, axis) {
        // ToDo: Get or set axis
        if (arguments.length < 1) throw new Error("axis function needs axisType argument.");
        if (arguments.length == 1) return this.axes[axisType];
        this.axes[axisType] = ggjs.axis(axis);
        return this;
    };

    prototype.count = function() {
        return ggjs.util.countObjKeys(this.axes);
        // var size = 0, key;
     //    for (key in this.axes) {
     //        if (this.axes.hasOwnProperty(key)) size++;
     //    }
     //    return size;
    };

    return axes;
})();

ggjs.axes = function (s) {
    return new ggjs.Axes(s);
};
