
ggjs.ggjs = (function () {
    // Init
    var render = function (spec) {
        // Load spec
        var plotDef = ggjs.plot(spec);

        // Render chart
        ggjs.renderer(plotDef).render();
    };

    return {
        render: render
    };
})();

    return ggjs;
});