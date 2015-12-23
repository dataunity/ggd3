// Create a registration system for plot layer renderers
ggjs.layerRendererPlugins = (function () {
    var layerRendererPlugins = {},
        createKey = function (coord, geom) {
            return coord + "_" + geom;
        },
        addLayerRenderer = function (coord, geom, renderer) {
            // Adds a new layer renderer that can draw a plot layer
            var key = createKey(coord, geom);
            layerRendererPlugins[key] = renderer;
        },
        getLayerRenderer = function (coord, geom) {
            // Gets a layer renderer that can draw a plot layer
            var key = createKey(coord, geom),
                renderer = layerRendererPlugins[key];
            return renderer || null;
        };
    return {
        addLayerRenderer: addLayerRenderer,
        getLayerRenderer: getLayerRenderer
    };
}());