ggjs.Layer = (function () {
    // Layers are responsible for creating the objects that we perceive on the plot. 
    // A layer is composed of:
    //  - data and aesthetic mapping,
    //  - a statistical transformation (stat),
    //  - a geometric object (geom), and
    //  - a position adjustment
    // 
    // GGPlot:
    //      layer(aes(x = x, y = y, color = z), geom="line",
    //      stat="smooth")
    // Ref [lg] 3.1
    var layer = function(spec) {
        // ToDo: move Namespace info out into separate module
        var ggjsPrefix = "ggjs",
            fillAesMap, xAesMap;
        this.layer = {
            data: spec.data || null,
            geom: ggjs.geom(spec.geom || {}),
            // geom: spec.geom || null,
            position: spec.position || null,
            // Sometimes order id is prefixed because JSON-LD context
            // has conflicts with other vocabs using 'orderId'.
            orderId: spec.orderId || spec[ggjsPrefix + ":orderId"] || null,
            // Note: support 'aesmapping' as name for aesmapping collection as well
            // as 'aesmapping' to support Linked Data style naming
            aesmappings: ggjs.aesmappings(spec.aesmappings || spec.aesmapping || [])
        };
        //if (s) ggjs.extend(this.layer, s);

        fillAesMap = this.layer.aesmappings.findByAes("fill");
        xAesMap = this.layer.aesmappings.findByAes("x");

        // Set defaults
        if (this.geom().geomType() === "GeomBar" && this.position() === "stack" &&
            fillAesMap !== null && xAesMap !== null && 
            fillAesMap.field() !== xAesMap.field()) {
            this.layer.useStackedData = true;
        } else {
            this.layer.useStackedData = false;
        }
        
    };

    var prototype = layer.prototype;

    prototype.data = function (val) {
        if (!arguments.length) return this.layer.data;
        this.layer.data = val;
        return this;
    };

    prototype.geom = function (val) {
        if (!arguments.length) return this.layer.geom;
        this.layer.geom = val;
        return this;
    };

    prototype.position = function (val) {
        if (!arguments.length) return this.layer.position;
        this.layer.position = val;
        return this;
    };

    prototype.orderId = function (val) {
        if (!arguments.length) return this.layer.orderId;
        this.layer.orderId = val;
        return this;
    };

    prototype.aesmappings = function (val) {
        if (!arguments.length) return this.layer.aesmappings;
        // ToDo: should val be obj or Axes (or either)?
        this.layer.aesmappings = val;
        return this;
    };

    prototype.useStackedData = function (val) {
        if (!arguments.length) return this.layer.useStackedData;
        this.layer.useStackedData = val;
        return this;
    };

    // prototype.useStackedData = function () {
    //  if (this.geom() === "bar" && this.position() === "stack") {
    //      return true;
    //  }
    //  return false;
    // }

    return layer;
})();

ggjs.layer = function(s) {
    return new ggjs.Layer(s);
};

ggjs.Layers = (function () {
    var layers = function(spec) {
        var isNullOrUndefined = ggjs.util.isNullOrUndefined,
            i;
        this.layers = [];
        for (i = 0; i < spec.length; i++) {
            this.layers.push(ggjs.layer(spec[i]));
        }
        // Sort layers by orderId
        this.layers.sort(function (lhs, rhs) {
            var lhsOrderId = isNullOrUndefined(lhs.orderId()) ? 0 : lhs.orderId(),
                rhsOrderId = isNullOrUndefined(rhs.orderId()) ? 0 : rhs.orderId();
            return lhsOrderId - rhsOrderId;
        });
    };

    var prototype = layers.prototype;

    prototype.count = function () {
        return this.layers.length;
    };

    prototype.asArray = function () {
        return this.layers;
    };

    return layers;
})();

ggjs.layers = function(s) {
    return new ggjs.Layers(s);
};
