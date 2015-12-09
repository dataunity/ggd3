ggjs.Data = (function () {
    var datasets = function (s) {
        var i, dataset;
        this.datasets = {};
        if (s) {
            for (i = 0; i < s.length; i++) {
                dataset = ggjs.dataset(s[i]);
                this.datasets[dataset.name()] = dataset;
            }
        }
    };

    var prototype = datasets.prototype;

    prototype.dataset = function (datasetName, dataset) {
        // ToDo: Get or set dataset
        if (arguments.length < 1) throw new Error("dataset function needs datasetName argument.");
        if (arguments.length === 1) return this.datasets[datasetName];
        // ToDo: set as object, ggjs dataset (or either)?
        this.datasets[datasetName] = ggjs.dataset(dataset);
        return this;
    };

    prototype.count = function () {
        return ggjs.util.countObjKeys(this.datasets);
    };

    prototype.names = function () {
        return ggjs.util.objKeys(this.datasets);
    };

    return datasets;
})();

ggjs.datasets = function (s) {
    return new ggjs.Data(s);
};