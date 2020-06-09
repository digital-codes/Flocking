/*
 * Flocking Synth
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2013-2018, Colin Clark
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */

/*global require, flock*/

var fluid = fluid || require("infusion"),
    flock = fluid.registerNamespace("flock");

/**
 * A synth is a collection of signal-generating units,
 * wired together to form an instrument.
 * They are created with a synthDef object,
 * which is a declarative structure that describes the instrument's
 * unit generator graph.
 */
fluid.defaults("flock.synth", {
    gradeNames: ["flock.node", "flock.noteTarget"],

    rate: flock.rates.AUDIO,

    addToEnvironment: true,

    mergePolicy: {
        ugens: "nomerge"
    },

    model: {
        audioSettings: "{that}.enviro.model.audioSettings"
    },

    members: {
        rate: "{that}.options.rate",
        nodeList: "@expand:flock.ugenNodeList()",
        out: undefined // Assigned onCreate
    },

    modelRelay: {
        target: "blockSize",
        singleTransform: {
            type: "fluid.transforms.condition",
            condition: {
                transform: {
                    type: "fluid.transforms.binaryOp",
                    left: "{that}.options.rate",
                    right: flock.rates.AUDIO,
                    operator: "==="
                }
            },
            true: "{that}.model.audioSettings.blockSize",
            false: 1
        }
    },

    invokers: {
        /**
         * Sets the value of the ugen at the specified path.
         *
         * @param {String||Object} a keypath or change specification object
         * @param {Number || UGenDef} val a value to set
         * @param {Boolean} swap whether or not to reattach the current unit generator's inputs to the new one
         * @return {UGen} the newly created UGen that was set at the specified path
         */
        set: {
            funcName: "flock.synth.set",
            args: ["{that}", "{that}.nodeList.namedNodes", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },

        /**
         * Gets the value of a ugen at the specified path.
         *
         * @param {String} path the ugen's path within the synth graph
         * @return {Number|UGen} a scalar value in the case of a value ugen, otherwise the ugen itself
         */
        get: {
            funcName: "flock.input.get",
            args: ["{that}.nodeList.namedNodes", "{arguments}.0"]
        },

        generate: {
            funcName: "flock.evaluate.synth",
            args: ["{that}"]
        }
    },

    listeners: {
        "onCreate.makeUGens": {
            funcName: "flock.synth.makeUGens",
            args: [
                "{that}"
            ]
        }
    }
});

flock.synth.makeUGens = function (that) {
    that.out = flock.makeUGens(that.options.synthDef, that.options.rate,
        that.nodeList, that.enviro, that.model.audioSettings);
};

flock.synth.set = function (that, namedNodes, path, val, swap) {
    return flock.input.set(namedNodes, path, val, undefined, function (ugenDef, path, target, prev) {
        return flock.synth.ugenValueParser(that, ugenDef, prev, swap);
    });
};

flock.synth.input = function (args, getFn, setFn) {
    //path, val, swap
    var path = args[0];

    return !path ? undefined : typeof path === "string" ?
        args.length < 2 ? getFn(path) : setFn.apply(null, args) :
        flock.isIterable(path) ? getFn(path) : setFn.apply(null, args);
};

// TODO: Reduce all these dependencies on "that" (i.e. a synth instance).
flock.synth.ugenValueParser = function (that, ugenDef, prev, swap) {
    if (ugenDef === null || ugenDef === undefined) {
        return prev;
    }

    var parsed = flock.parse.ugenDef(ugenDef, that.enviro, {
        audioSettings: that.model.audioSettings,
        buses: that.enviro.busManager.buses,
        buffers: that.enviro.buffers
    });

    var newUGens = flock.isIterable(parsed) ? parsed : (parsed !== undefined ? [parsed] : []),
        oldUGens = flock.isIterable(prev) ? prev : (prev !== undefined ? [prev] : []);

    var replaceLen = Math.min(newUGens.length, oldUGens.length),
        replaceFnName = swap ? "swapTree" : "replaceTree",
        i,
        atIdx,
        j;

    // TODO: Improve performance by handling arrays inline instead of repeated function calls.
    for (i = 0; i < replaceLen; i++) {
        atIdx = flock.ugenNodeList[replaceFnName](that.nodeList, newUGens[i], oldUGens[i]);
    }

    for (j = i; j < newUGens.length; j++) {
        atIdx++;
        flock.ugenNodeList.insertTree(that.nodeList, newUGens[j], atIdx);
    }

    for (j = i; j < oldUGens.length; j++) {
        flock.ugenNodeList.removeTree(that.nodeList, oldUGens[j]);
    }

    return parsed;
};
