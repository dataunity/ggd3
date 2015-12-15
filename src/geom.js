ggjs.Geom = (function () {
    var geom = function(s) {
        this.geom = {
            // Support JSON-LD type Geom type
            geomType: s.geomType || s["@type"] || "GeomBar"
        };
    };

    var prototype = geom.prototype;

    prototype.geomType = function (l) {
        if (!arguments.length) return this.geom.geomType;
        this.geom.geomType = l;
        return this;
    };

    return geom;
})();

ggjs.geom = function (s) {
    return new ggjs.Geom(s);
};
