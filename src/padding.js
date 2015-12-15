ggjs.Padding = (function () {
    var padding = function(s) {
        this.padding = {
            left: s.left || 40,
            right: s.right || 20,
            top: s.top || 20,
            bottom: s.bottom || 70
        };
        //if (s) ggjs.extend(this.padding, s);
    };

    var prototype = padding.prototype;

    prototype.left = function (l) {
        if (!arguments.length) return this.padding.left;
        this.padding.left = l;
        return this;
    };

    prototype.right = function (r) {
        if (!arguments.length) return this.padding.right;
        this.padding.right = r;
        return this;
    };

    prototype.top = function (t) {
        if (!arguments.length) return this.padding.top;
        this.padding.top = t;
        return this;
    };

    prototype.bottom = function (b) {
        if (!arguments.length) return this.padding.bottom;
        this.padding.bottom = b;
        return this;
    };

    return padding;
})();

ggjs.padding = function (s) {
    return new ggjs.Padding(s);
};
