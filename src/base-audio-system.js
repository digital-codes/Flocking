/*
 * Flocking Base Audio System
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2011-2020, Colin Clark
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */

 /*global fluid, flock*/

 (function () {
    "use strict";

    /***********************
     * Synths and Playback *
     ***********************/

    fluid.defaults("flock.audioSystem", {
        gradeNames: ["fluid.modelComponent"],

        channelRange: {
            min: 1,
            max: 32
        },

        outputBusRange: {
            min: 2,
            max: 1024
        },

        inputBusRange: {
            min: 1, // TODO: This constraint should be removed.
            max: 32
        },

        model: {
            rates: {
                audio: 44100,
                control: 689.0625,
                scheduled: 0,
                demand: 0,
                constant: 0
            },
            blockSize: 64,
            numBlocks: 16, // TODO: Move this and its transform into the web/output-manager.js
            chans: 2,
            numInputBuses: 2,
            numBuses: 8,
            bufferSize: "@expand:flock.audioSystem.defaultBufferSize()"
        },

        modelRelay: [
            {
                target: "rates.control",
                singleTransform: {
                    type: "fluid.transforms.binaryOp",
                    left: "{that}.model.rates.audio",
                    operator: "/",
                    right: "{that}.model.blockSize"
                }
            },
            {
                target: "numBlocks",
                singleTransform: {
                    type: "fluid.transforms.binaryOp",
                    left: "{that}.model.bufferSize",
                    operator: "/",
                    right: "{that}.model.blockSize"
                }
            },
            {
                target: "chans",
                singleTransform: {
                    type: "fluid.transforms.limitRange",
                    input: "{that}.model.chans",
                    min: "{that}.options.channelRange.min",
                    max: "{that}.options.channelRange.max"
                }
            },
            {
                target: "numInputBuses",
                singleTransform: {
                    type: "fluid.transforms.limitRange",
                    input: "{that}.model.numInputBuses",
                    min: "{that}.options.inputBusRange.min",
                    max: "{that}.options.inputBusRange.max"
                }
            },
            {
                target: "numBuses",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "flock.audioSystem.clampNumBuses",
                    args: [
                        "{that}.model.numBuses",
                        "{that}.options.outputBusRange",
                        "{that}.model.chans"
                    ]
                }
            }
        ]
    });

    flock.audioSystem.clampNumBuses = function (numBuses, outputBusRange, chans) {
        numBuses = Math.max(numBuses, Math.max(chans, outputBusRange.min));
        numBuses = Math.min(numBuses, outputBusRange.max);

        return numBuses;
    };

    flock.audioSystem.defaultBufferSize = function () {
        return flock.platform.isMobile ? 8192 :
            flock.platform.browser.mozilla ? 2048 : 1024;
    };
}());
