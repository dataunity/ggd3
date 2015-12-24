// Create a registration system for plot layer renderers
ggjs.layerRendererPlugins = (function () {
    var layerRendererPlugins = {},
        createKey = function (rendererType, coord, geom) {
            return rendererType + "_" + coord + "_" + geom;
        },
        addLayerRenderer = function (rendererType, coord, geom, renderer) {
            // Adds a new layer renderer that can draw a plot layer
            var key = createKey(rendererType, coord, geom);
            layerRendererPlugins[key] = renderer;
        },
        getLayerRenderer = function (rendererType, coord, geom) {
            // Gets a layer renderer that can draw a plot layer
            var key = createKey(rendererType, coord, geom),
                renderer = layerRendererPlugins[key];
            return renderer || null;
        };
    return {
        addLayerRenderer: addLayerRenderer,
        getLayerRenderer: getLayerRenderer
    };
}());