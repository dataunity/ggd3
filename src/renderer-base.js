// Base 'class' for plot renderers
ggjs.RendererBase = (function () {
    var baseRenderer = function () {
    };

    var prototype = baseRenderer.prototype;

    prototype.plotDef = function (val) {
        if (!arguments.length) return this._plotDef;
        this._plotDef = val;
        return this;
    };

    prototype.scaleDef = function (scaleName) {
        return this.plotDef().scales().scale(scaleName);
    };

    prototype.buildScales = function () {
        throw new Error("Override in sub class.");
    };

    prototype.setupXAxis = function () {
        throw new Error("Override in sub class.");
    };

    prototype.setupYAxis = function () {
        throw new Error("Override in sub class.");
    };

    prototype.drawAxes = function () {
        throw new Error("Override in sub class.");
    };

    prototype.drawLayers = function () {
        throw new Error("Override in sub class.");
    };

    prototype.drawLegends = function () {
        throw new Error("Override in sub class.");
    };

    // ------------
    // Data ranges
    // ------------

    prototype.getDataset = function (datasetName) {
        var plotDef = this.plotDef(),
            dataset = plotDef.data().dataset(datasetName),
            datasetNames;
        if (dataset === null || typeof dataset === "undefined") {
            // Use default dataset for the plot
            datasetNames = plotDef.data().names();
            if (datasetNames.length !== 1) {
                throw new Error("Expected one DataSet in the Plot to use as the default DataSet");
            }
            datasetName = datasetNames[0];
            dataset = plotDef.data().dataset(datasetName);

            if (dataset === null) {
                throw new Error("Couldn't find a layer DataSet or a default DataSet.");
            }
        }
        return dataset;
    };

    prototype.statAcrossLayers = function (aes, stat) {
        // Looks at the data across all layers for an
        // aesthetic and gets info about it (e.g. max or min)
        var plotDef = this.plotDef(),
            layers = plotDef.layers().asArray(),
            statVal = null,
            i, layer, aesmap, field, tmpStat,
            datasetName, dataset;

        for (i = 0; i < layers.length; i++) {
            layer = layers[i];
            aesmap = layer.aesmappings().findByAes(aes);

            // Layer data
            datasetName = layer.data();
            if (!datasetName) {
                datasetName = plotDef.defaultDatasetName();
            }
            //dataset = plotDef.data().dataset(datasetName);
            dataset = this.getDataset(datasetName);
            if (dataset === null) {
                throw new Error("Unable to find dataset with name " + datasetName);
            }

            if (aesmap) {
                field = aesmap.field();
                if (stat === "max" && layer.useStackedData()) {
                    // Stack data
                    tmpStat = this.layerStackedDataMax(layer, dataset, aes);
                } else {
                    // Normal case for finding aes value
                    tmpStat = ggjs.dataHelper.datatableStat(dataset.values(), field, stat);
                }
                if (!isNaN(tmpStat)) {
                    if (statVal === null) statVal = tmpStat;
                    statVal = stat === "min" ? Math.min(statVal, tmpStat) : Math.max(statVal, tmpStat);
                }
            }
        }

        return statVal;
    };

    prototype.layerStackedDataMax = function (layer, dataset, aes) {
        // Find the max value for the stacked data on this level.
        // Highest value for stacked data is sum of values in group, 
        // not the highest value across the whole value column
        var tmpStat,
            xAes = layer.aesmappings().findByAes("x"), 
            fillAes = layer.aesmappings().findByAes("fill"),
            valueAes = layer.aesmappings().findByAes(aes);

        if (valueAes === null) {
            throw new Error("Need value aes map to find stacked value");
        }
        if (xAes === null) {
            throw new Error("Need x aes map to find stacked value");
        }
        if (fillAes === null) {
            throw new Error("Need fill aes map to find stacked value");
        }

        if (aes === "y") {
            // ToDo: is the fill aes the only way to specify stacked figures?
            tmpStat = ggjs.dataHelper.maxStackValue(dataset.values(), 
                xAes.field(), fillAes.field(), valueAes.field());
        } else {
            throw new Error("Don't know how to find stacked value for value aes " + aes);
        }

        return tmpStat;
    };

    prototype.allValuesForLayer = function (layer, aesmap) {
        // Gets all data values for an aes in a layer
        var plotDef = this.plotDef(),
            values = [],
            //tmpVals, 
            i, field,
            datasetName, dataset;

        // Layer data
        datasetName = layer.data();
        if (!datasetName) {
            datasetName = plotDef.defaultDatasetName();
        }
        dataset = this.getDataset(datasetName);
        if (dataset === null) {
            throw new Error("Unable to find dataset with name " + datasetName);
        }

        if (aesmap) {
            field = aesmap.field();
            
            if (dataset.values().map) {
                values = dataset.values().map(function (d) { return d[field]; });
            } else {
                // backup way to get values from data
                // ToDo: use array.map polyfill so this can be removed?
                var dsVals = dataset.values(),
                    j;
                this.warning("Old browser - doesn't support array.map");
                for (j = 0; j < dsVals.length; j++) {
                    values.push(dsVals[j][field]);
                }
            }
            // values = d3.merge([ values, tmpVals ]);
        }

        return values;
    };

    prototype.allValuesAcrossLayers = function (aes) {
        // Looks at the data across all layers for an
        // aesthetic and gets all it's values
        var plotDef = this.plotDef(),
            layers = plotDef.layers().asArray(),
            values = [],
            tmpVals, i, layer, aesmap, field,
            datasetName, dataset;

        for (i = 0; i < layers.length; i++) {
            layer = layers[i];
            aesmap = layer.aesmappings().findByAes(aes);

            tmpVals = this.allValuesForLayer(layer, aesmap);
            values = values.concat(tmpVals);
            // values = d3.merge([ values, tmpVals ]);

            // // Layer data
            // datasetName = layer.data();
            // if (!datasetName) {
            //  datasetName = plotDef.defaultDatasetName();
            // }
            // //dataset = plotDef.data().dataset(datasetName);
            // dataset = this.getDataset(datasetName);
            // if (dataset == null) {
            //  throw "Unable to find dataset with name " + datasetName;
            // }

            // if (aesmap) {
            //  field = aesmap.field();
                
            //  if (dataset.values().map) {
            //      tmpVals = dataset.values().map(function (d) { return d[field]; });
            //  } else {
            //      // backup way to get values from data
            //      // ToDo: use array.map polyfill so this can be removed?
            //      var tmpVals = [],
            //          dsVals = dataset.values(),
            //          j;
            //      this.warning("Old browser - doesn't support array.map");
            //      for (j = 0; j < dsVals.length; j++) {
            //          tmpVals.push(dsVals[j][field]);
            //      }
            //  }
            //  values = d3.merge([ values, tmpVals ]);
            // }
        }

        return values;
    };

    return baseRenderer;
}());


// Base 'class' for D3 renderers
ggjs.D3RendererBase = (function (d3) {
    var d3RendererBase = function () {
    };

    // 'Inherit' base class prototype
    var prototype = ggjs.util.extend(d3RendererBase.prototype, ggjs.RendererBase.prototype);



    // -------
    // Scales
    // -------

    prototype.d3Scale = function (scaleName, val) {
        if (!arguments.length) {
            throw new Error("Must supply args when getting/setting d3 scale");
        }

        // if (ggjs.util.isUndefined(this._scaleNameToD3Scale)) {
        //     this._scaleNameToD3Scale = {};
        // }

        else if (arguments.length === 1) {
            return this._scaleNameToD3Scale[scaleName];
            // return this.renderer.scaleNameToD3Scale[scaleName];
        } else {
            this._scaleNameToD3Scale[scaleName] = val;
            // this.renderer.scaleNameToD3Scale[scaleName] = val;
        }
        
        return this;
    };

    prototype.setupAxisScale = function (aes, scale, scaleDef) {
        var min = 0,
            max,
            allValues = [];

        
        if (scaleDef.hasDomain()) {
            scale.domain(scaleDef.domain());
        } else {
            // If scale domain hasn't been set, use data to find it
            if (scaleDef.isQuantitative()) {
                max = this.statAcrossLayers(aes, "max");
                if (!isNaN(max)) {
                    scale.domain([0, max]).nice();
                }
            } else if (scaleDef.isOrdinal()) {
                allValues = this.allValuesAcrossLayers(aes);
                scale.domain(allValues);
                //scale.domain(data.map(function(d) { return d.letter; }));
            } else if (scaleDef.isTime()) {
                min = this.statAcrossLayers(aes, "min");
                max = this.statAcrossLayers(aes, "max");
                if (isNaN(min)) {
                    min = new Date(1970, 0, 1);
                }
                if (isNaN(max)) {
                    max = new Date(Date.now());
                }
                scale.domain([min, max]).nice();
            }
        }
        
    };

    prototype.buildScales = function () {
        var plotDef = this.plotDef(),
            layerDefs = plotDef.layers().asArray(),
            i, j,
            // scaleNamesLookup = {},
            // scaleNames = [],
            scaleNameToLayerInfos = {},
            // scaleNameToLayer = {},
            // scaleNameToAesMap = {},
            scaleDef,
            layerInfo,
            layerInfos,
            layerDef,
            tmpScale,
            values,
            tmpVals,
            min, max,
            aesmappings, aesmapping, aes, scaleName, scale;

        // Find names of all the scales used
        for (i = 0; i < layerDefs.length; i++) {
            layerDef = layerDefs[i];
            aesmappings = layerDef.aesmappings().asArray();

            // console.log("aesmappings", aesmappings)
            if (aesmappings) {
                for (j = 0; j < aesmappings.length; j++) {
                    aesmapping = aesmappings[j];
                    // console.log(aesmapping)
                    aes = aesmapping.aes();
                    // Skip aesthetics which are already display as axis
                    // if (aes === "x" || aes === "y") {
                    //  continue;
                    // }
                    scaleName = aesmapping.scaleName();
                    if (scaleName === null) {
                        continue;
                    }
                    // Store the information about where scale is used
                    layerInfo = {
                        layerDef: layerDef,
                        aesmapping: aesmapping
                    };
                    if (typeof scaleNameToLayerInfos[scaleName] === 'undefined') {
                        scaleNameToLayerInfos[scaleName] = [layerInfo];
                    } else {
                        scaleNameToLayerInfos[scaleName].push(layerInfo);
                    }
                    
                    // scaleNameToLayer[scaleName] = layer;
                    // scaleNameToAesMap[scaleName] = aesmapping;
                    // console.log("aesmapping", aes, scaleName);
                    // if (scaleName != null && typeof scaleNamesLookup[scaleName] === 'undefined') {
                    //  scaleNames.push(scaleName);
                    //  scaleNamesLookup[scaleName] = true;
                    // }
                }
            }
        }

        // Create a D3 scale for each scale
        // console.log("Creating d3 scales")
        for (scaleName in scaleNameToLayerInfos) {
            scaleDef = plotDef.scales().scale(scaleName);
            scale = this.scale(scaleDef);
            if (scaleDef.hasDomain()) {
                scale.domain(scaleDef.domain());
            } else {
                // If scale domain hasn't been set, use data to find it
                if (scaleDef.isQuantitative()) {
                    max = this.statAcrossLayers(aes, "max");
                    if (!isNaN(max)) {
                        scale.domain([0, max]).nice();
                    }
                } else if (scaleDef.isOrdinal()) {
                    // Find values across all layers
                    layerInfos = scaleNameToLayerInfos[scaleName];
                    values = [];
                    // console.log("scaleName", scaleName)
                    for (i = 0; i < layerInfos.length; i++) {
                        layerInfo = layerInfos[i];
                        layerDef = layerInfo.layerDef;
                        aesmapping = layerInfo.aesmapping;
                        // ToDo: cache values for layer/field combos
                        // console.log("layer info", scaleName, layerDef.data(), aesmapping.aes(), aesmapping.field());
                        tmpVals = this.allValuesForLayer(layerDef, aesmapping);
                        values = d3.merge([ values, tmpVals ]);
                    }
                    scale.domain(values);
                } else if (scaleDef.isTime()) {
                    // min = this.statAcrossLayers(aes, "min");
                    // max = this.statAcrossLayers(aes, "max");
                    // if (!isNaN(max)) {
                    //  scale.domain([0, max]).nice();
                    // }
                    console.log("setting time scale domain");
                    min = new Date(2014);
                    max = new Date(2016);
                    scale.domain([min, max]).nice();
                }
            }
            
            this.d3Scale(scaleName, scale);
        }
    };

    prototype.scale = function (scaleDef) {
        // Produces D3 scale from ggjs scale definition
        var scale = null;
        scaleDef = scaleDef || ggjs.scale({});
        switch (scaleDef.type()) {
            case "linear":
                scale = d3.scale.linear();
                break;
            case "ordinal":
                scale = d3.scale.ordinal();
                break;
            case "pow":
                scale = d3.scale.pow();
                break;
            case "time":
                scale = d3.time.scale();
                break;
            case "category10":
                scale = d3.scale.category10();
                break;
            default:
                throw new Error("Unknow D3 scale type " + scaleDef.type());
        }

        if (scale === null) {
            scale = d3.scale.linear();
        }

        return scale;
    };


    // -----
    // Axes
    // -----

    prototype.setupXAxis = function () {
        // Produces D3 x axis
        var plotDef = this.plotDef(),
            axis = d3.svg.axis()
                .orient("bottom"),
            axisDef = this.plotDef().axes().axis("x") || {},
            scaleRef = axisDef.scaleName(),
            scaleDef = plotDef.scales().scale(scaleRef),
            scale = this.scale(scaleDef);

        // ToDo: determine if domain has been manually set on x axis
        // ToDo: account for facets
        //x.domain(d3.extent(data, function(d) { return d.sepalWidth; })).nice();

        // Set scale range
        // ToDo: account for facets
        switch (plotDef.coord()) {
            case "cartesian":
                // X scale range is always width of plot area
                scale.range([0, plotDef.plotAreaWidth()]);
                if (scaleDef.isOrdinal()) {
                    scale.rangeRoundBands([0, plotDef.plotAreaWidth()], 0.1);
                }
                break;
            case "polar":
                scale.range([0, 2 * Math.PI]);
                if (scaleDef.isOrdinal()) {
                    scale.rangeBands([0, 2 * Math.PI], 0);
                }
                break;
            case "mercator":
                console.log("ToDo: set up geo axis");
                break;
            default:
                throw new Error("Don't know how to set axis range for co-ordinate type " + plotDef.coord());
        }

        this.setupAxisScale("x", scale, scaleDef);
        axis.scale(scale);

        axis.ticks(5);

        this.xAxisScaleDef(scaleDef);
        this.xAxis(axis);
    };

    prototype.setupYAxis = function () {
        // Produces D3 y axis
        var plotDef = this.plotDef(),
            axis = d3.svg.axis()
                .orient("left"),
            axisDef = this.plotDef().axes().axis("y") || {},
            scaleRef = axisDef.scaleName(),
            scaleDef = plotDef.scales().scale(scaleRef),
            scale = this.scale(scaleDef);

        // ToDo: determine if domain has been manually set on y axis
        // ToDo: account for facets
        //y.domain(d3.extent(data, function(d) { return d.sepalLength; })).nice();
        
        // ToDo: account for facets
        switch (plotDef.coord()) {
            case "cartesian":
                // Y scale range is height of plot area
                scale.range([plotDef.plotAreaHeight(), 0]);
                break;
            case "polar":
                // Y scale range is half height of plot area
                scale.range([Math.floor(plotDef.plotAreaHeight() / 2), 0]);
                break;
            case "mercator":
                console.log("ToDo: set up geo axis");
                break;
            default:
                throw new Error("Don't know how to set axis range for co-ordinate type " + plotDef.coord());
        }

        this.setupAxisScale("y", scale, scaleDef);
        axis.scale(scale);

        axis.ticks(5);

        this.yAxisScaleDef(scaleDef);
        this.yAxis(axis);
    };

    prototype.xAxis = function (val) {
        if (!arguments.length) return this._xAxis;
        this._xAxis = val;
        return this;
    };

    prototype.yAxis = function (val) {
        if (!arguments.length) return this._yAxis;
        this._yAxis = val;
        return this;
    };

    prototype.xAxisScaleDef = function (val) {
        if (!arguments.length) return this._xAxisScaleDef;
        this._xAxisScaleDef = val;
        return this;
    };

    prototype.yAxisScaleDef = function (val) {
        if (!arguments.length) return this._yAxisScaleDef;
        this._yAxisScaleDef = val;
        return this;
    };


    // --------
    // Styling
    // --------

    prototype.defaultFillColor = function (val) {
        if (!arguments.length) return this._defaultFillColor;
        this._defaultFillColor = val;
        return this;
    };

    prototype.applyFillColour = function (svgItems, aesmappings) {
        // Applies fill colour to svg elements
        // Params:
        //  svgItems: the svg elements as D3 select list
        //  aesmappings: the layer's aesmappings

        // Fill colour
        // ToDo: setup colour scale across all layers, so colours
        // are matched across layers
        console.log("Warning: move colour mapping to all levels.");
        var plotDef = this.plotDef(),
            fillAesMap = aesmappings.findByAes("fill"),
            defaultFillColor = this.defaultFillColor();
        if (fillAesMap !== null) {
            var colorField = fillAesMap.field(),
                colorScaleDef = this.scaleDef(fillAesMap.scaleName()),
                scaleName = fillAesMap.scaleName(),
                colorScale;
            // if (colorScaleDef == null) {
            //  this.warning("Couldn't set colour on layer - fill colour scale missing.")
            //  svgItems.style("fill", function(d) { return defaultFillColor; });
            // } else {
            //  colorScale = this.scale(colorScaleDef);
            //  svgItems.style("fill", function(d) { return colorScale(d[colorField]); });
            // }
            
            if (scaleName === null) {
                this.warning("Couldn't set colour on layer - fill colour scale missing.");
                svgItems.style("fill", function(d) { return defaultFillColor; });
            } else {
                colorScale = this.d3Scale(scaleName);
                console.log("Using d3 scale", scaleName, colorScale.domain());
                svgItems.style("fill", function(d) { return colorScale(d[colorField]); });
            }   
        } else {
            svgItems.style("fill", function(d) { return defaultFillColor; });
        }
    };

    return d3RendererBase;
}(d3));