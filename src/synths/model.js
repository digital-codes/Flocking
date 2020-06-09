/*
 * Flocking Modelized Synth
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2013-2015, Colin Clark
 * Copyright 2015, OCAD University
 *
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */

/*global require*/
/*jshint white: false, newcap: true, regexp: true, browser: true,
    forin: false, nomen: true, bitwise: false, maxerr: 100,
    indent: 4, plusplus: false, curly: true, eqeqeq: true,
    freeze: true, latedef: true, noarg: true, nonew: true, quotmark: double, undef: true,
    unused: true, strict: true, asi: false, boss: false, evil: false, expr: false,
    funcscope: false*/

var fluid = fluid || require("infusion"),
    flock = fluid.registerNamespace("flock");

(function () {
    "use strict";

    fluid.defaults("flock.modelSynth", {
        gradeNames: "flock.synth",

        model: {
            inputs: {},
            value: undefined
        },

        modelListeners: {
            "inputs": [
                {
                    excludeSource: "init",
                    funcName: "flock.modelSynth.updateUGens",
                    args: ["{that}.set", "{that}.out", "{change}"]
                }
            ]
        },

        invokers: {
            generate: {
                funcName: "flock.evaluate.synthModel"
            }
        },

        listeners: {
            "onCreate.pushModelToUGens": {
                priority: "after:makeUGens",
                funcName: "flock.modelSynth.pushModelToUGens",
                args: [
                    "{that}.set",
                    "{that}.out",
                    "{that}.model.inputs"
                ]
            }
        }
    });

    flock.modelSynth.pushModelToUGens = function (set, ugens, model) {
        var changeSpec = {};
        flock.modelSynth.flattenModel("", model, changeSpec);
        set(changeSpec);
    };

    flock.modelSynth.updateUGens = function (set, ugens, change) {
        flock.modelSynth.pushModelToUGens(set, ugens, change.value);
    };

    flock.modelSynth.shouldFlattenValue = function (value) {
        return fluid.isPrimitive(value) || flock.isIterable(value) || value.ugen;
    };

    flock.modelSynth.flattenModel = function (path, model, changeSpec) {
        for (var key in model) {
            var value = model[key],
                newPath = fluid.pathUtil.composePath(path, key.toString());

            if (flock.modelSynth.shouldFlattenValue(value)) {
                changeSpec[newPath] = value;
            } else {
                flock.modelSynth.flattenModel(newPath, value, changeSpec);
            }
        }

        return changeSpec;
    };
}());
