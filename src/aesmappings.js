ggjs.AesMapping = (function () {
    // Aesthetic mapping shows which variables are mapped to which
    // aesthetics. For example, we might map weight to x position, 
    // height to y position, and age to size. 
    // 
    // GGPlot:
    //      layer(aes(x = x, y = y, color = z))
    // Ref [lg] 3.1.1
    var aesmap = function(s) {
        this.aesmap = {
            aes: s.aes || null,
            field: s.field || null,
            scaleName: s.scaleName || null
        };
        //if (s) ggjs.extend(this.aesmap, s);
    };

    var prototype = aesmap.prototype;

    prototype.aes = function (val) {
        if (!arguments.length) return this.aesmap.aes;
        this.aesmap.aes = val;
        return this;
    };

    prototype.field = function (val) {
        if (!arguments.length) return this.aesmap.field;
        this.aesmap.field = val;
        return this;
    };

    prototype.scaleName = function (val) {
        if (!arguments.length) return this.aesmap.scaleName;
        this.aesmap.scaleName = val;
        return this;
    };

    return aesmap;
})();

ggjs.aesmapping = function (s) {
    return new ggjs.AesMapping(s);
};

ggjs.AesMappings = (function () {
    var aesmappings = function(spec) {
        var i;
        this.aesmappings = [];
        for (i = 0; i < spec.length; i++) {
            this.aesmappings.push(ggjs.aesmapping(spec[i]));
        }
    };

    var prototype = aesmappings.prototype;

    prototype.findByAes = function (aesName) {
        // Finds an aesthetic mapping by aesthetic name
        var mappings = this.aesmappings,
            i, tmpAesmap;
        for (i = 0; i < mappings.length; i++) {
            tmpAesmap = mappings[i];
            if (tmpAesmap.aes() === aesName) {
                return tmpAesmap;
            }
        }
        return null;
    };

    prototype.count = function () {
        return this.aesmappings.length;
    };

    prototype.asArray = function () {
        return this.aesmappings;
    };

    return aesmappings;
})();

ggjs.aesmappings = function (s) {
    return new ggjs.AesMappings(s);
};