ggjs.dataHelper = (function (d3) {
    var datatableMin = function (datatable, field) {
            // Finds the min value of the field in the datatable
            return d3.min(datatable, function (d) { return d[field]; });
        },
        datatableMax = function (datatable, field) {
            // Finds the max value of the field in the datatable
            return d3.max(datatable, function (d) { return d[field]; });
        },
        datatableSum = function (datatable, field) {
            // Finds the sum of values for the field in the datatable
            return d3.sum(datatable, function (d) { return d[field]; });
        },
        datatableStat = function (datatable, field, stat) {
            // Finds the value of the stat (e.g. max) for the field in the datatable
            var statVal = null;
            switch (stat) {
                case "min":
                case "max":
                    statVal = stat === "min" ? datatableMin(datatable, field) : datatableMax(datatable, field);
                    break;
                case "sum":
                    statVal = datatableSum(datatable, field);
                    break;
                default:
                    throw new Error("Can't get datatables stat, unknown stat " + stat);
            }
            return statVal;
        },
        datatablesStat = function (datatables, field, stat) {
            var statVal = null,
                i, tmpStat;

            switch (stat) {
                case "min":
                case "max":
                    for (i = 0; i < datatables.length; i++) {
                        tmpStat = stat === "min" ? datatableMin(datatables[i], field) : datatableMax(datatables[i], field);
                        if (!isNaN(tmpStat)) {
                            if (statVal === null) statVal = tmpStat;
                            statVal = stat === "min" ? Math.min(statVal, tmpStat) : Math.max(statVal, tmpStat);
                        }
                    }
                    break;
                default:
                    throw new Error("Can't get datatables stat, unknown stat " + stat);
            }

            return statVal;
        },
        generateStackYValues = function (data, groupField, stackField, valueField) {
            // Adds an extra y value called __y0__ to the data
            // which gives the y value of the previous record within
            // the stacked items of the group.
            // Useful for stacked bar charts where an extra y value is
            // needed to know where the last bar in the group was placed.
            var dataCopy = ggjs.util.deepCopy(data),
                nested = d3.nest()
                    .key(function (d) { return d[groupField]; })
                    .key(function (d) { return d[stackField]; })
                    .entries(dataCopy),
                groupKeys, stackKeys, values,
                i, j, k, prevValue;

            for (i = 0; i < nested.length; i++) {
                // Group 1 level
                prevValue = 0;
                groupKeys = nested[i];
                for (j = 0; j < groupKeys.values.length; j++) {
                    // Group 2 level
                    stackKeys = groupKeys.values[j];
                    for (k = 0; k < stackKeys.values.length; k++) {
                        // Values level
                        values = stackKeys.values[k];
                        values.__y0__ = prevValue;
                        prevValue += values[valueField];
                    }
                }
            }

            return dataCopy;
        },
        maxStackValue = function (data, groupField, stackField, valueField) {
            // Finds the max value by summing stacked items within a group,
            // then find the max across groups.
            // For example it finds the max height of all the layers bars in
            // a stacked bar chart.
            var nested_data, max;

            // Get sum of each stack grouping
            nested_data = d3.nest()
                .key(function(d) { return d[groupField]; })
                //.key(function(d) { return d[stackField]; })
                .rollup(function(leaves) { 
                    return {
                        "stack_sum": d3.sum(leaves, function(d) {
                            return d[valueField];
                        })};
                })
                .entries(data);

            // Find max value across stack groupings
            max = d3.max(nested_data, function (d) { return d.values.stack_sum; });

            return max;
        },
        sortDatatable = function (datatable, field) {
            // Sorts the datatable rows according to the supplied field
            // Mutates the datatable
            datatable.sort(function (a, b) {
                if (a[field] > b[field]) {
                    return 1;
                }
                if (a[field] < b[field]) {
                    return -1;
                }
                return 0;
            });
            return datatable;
        };

    return {
        datatableMin: datatableMin,
        datatableMax: datatableMax,
        datatableSum: datatableSum,
        datatableStat: datatableStat,
        datatablesStat: datatablesStat,
        generateStackYValues: generateStackYValues,
        maxStackValue: maxStackValue,
        sortDatatable: sortDatatable
    };
})(d3);
