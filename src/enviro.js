/*
 * Flocking Environment
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2011-2020, Colin Clark
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */


 /*global fluid, flock*/
 (function () {

    "use strict";

    // TODO: Factor out buffer logic into a separate component.
    fluid.defaults("flock.enviro", {
        gradeNames: [
            "fluid.modelComponent",
            "flock.nodeListComponent",
            "fluid.resolveRootSingle"
        ],

        singleRootType: "flock.enviro",

        members: {
            buffers: {},
            bufferSources: {}
        },

        components: {
            audioSystem: {
                type: "flock.audioSystem"
            },

            busManager: {
                type: "flock.busManager"
            }
        },

        model: {
            isPlaying: false,
            audioSettings: "{audioSystem}.model"
        },

        invokers: {
            /**
             * Generates a block of samples by evaluating all registered nodes.
             */
            generate: {
                funcName: "flock.enviro.generate",
                args: ["{busManager}.buses", "{audioSystem}.model", "{that}.nodeList.nodes"]
            },

            /**
             * Starts generating samples from all synths.
             *
             * @param {Number} dur optional duration to play in seconds
             */
            start: "flock.enviro.start({that}.model, {that}.events.onStart.fire)",

            /**
             * Deprecated. Use start() instead.
             */
            play: "{that}.start",

            /**
             * Stops generating samples.
             */
            stop: "flock.enviro.stop({that}.model, {that}.events.onStop.fire)",


            /**
             * Fully resets the state of the environment.
             */
            reset: "{that}.events.onReset.fire()",

            /**
             * Registers a shared buffer.
             *
             * @param {BufferDesc} bufDesc the buffer description object to register
             */
            registerBuffer: "flock.enviro.registerBuffer({arguments}.0, {that}.buffers)",

            /**
             * Releases a shared buffer.
             *
             * @param {String|BufferDesc} bufDesc the buffer description (or string id) to release
             */
            releaseBuffer: "flock.enviro.releaseBuffer({arguments}.0, {that}.buffers)",

            /**
             * Saves a buffer to the user's computer.
             *
             * @param {String|BufferDesc} id the id of the buffer to save
             * @param {String} path the path to save the buffer to (if relevant)
             */
            saveBuffer: {
                funcName: "flock.enviro.saveBuffer",
                args: [
                    "{arguments}.0",
                    "{that}.buffers",
                    "{audioSystem}"
                ]
            }
        },

        events: {
            onStart: null,
            onPlay: "{that}.events.onStart", // Deprecated. Use onStart instead.
            onStop: null,
            onReset: null
        },

        listeners: {
            "onStart.updatePlayState": {
                changePath: "isPlaying",
                value: true
            },

            "onStop.updatePlayState": {
                changePath: "isPlaying",
                value: false
            },

            "onReset.stop": "{that}.stop()",

            "onReset.clearAllNodes": {
                priority: "after:stop",
                func: "flock.nodeList.clearAll",
                args: ["{that}.nodeList"]
            },

            "onReset.resetBusManager": {
                priority: "after:clearAllNodes",
                func: "{busManager}.reset"
            },

            "onReset.clearBuffers": {
                priority: "after:resetBusManager",
                funcName: "fluid.clear",
                args: ["{that}.buffers"]
            }
        }
    });

    flock.enviro.registerBuffer = function (bufDesc, buffers) {
        if (bufDesc.id) {
            buffers[bufDesc.id] = bufDesc;
        }
    };

    flock.enviro.releaseBuffer = function (bufDesc, buffers) {
        if (!bufDesc) {
            return;
        }

        var id = typeof bufDesc === "string" ? bufDesc : bufDesc.id;
        delete buffers[id];
    };

    flock.enviro.saveBuffer = function (o, buffers, audioSystem) {
        if (typeof o === "string") {
            o = {
                buffer: o
            };
        }

        if (typeof o.buffer === "string") {
            var id = o.buffer;
            o.buffer = buffers[id];
            o.buffer.id = id;
        }

        o.type = o.type || "wav";
        o.path = o.path || o.buffer.id + "." + o.type;
        o.format = o.format || "int16";

        return audioSystem.bufferWriter.save(o, o.buffer);
    };

    flock.enviro.generate = function (buses, audioSettings, nodes) {
        flock.evaluate.clearBuses(buses,
            audioSettings.numBuses, audioSettings.blockSize);
        flock.evaluate.synths(nodes);
    };

    flock.enviro.start = function (model, onStart) {
        if (!model.isPlaying) {
            onStart();
        }
    };

    flock.enviro.stop = function (model, onStop) {
        if (model.isPlaying) {
            onStop();
        }
    };


    fluid.defaults("flock.enviroScheduler", {
        gradeNames: "berg.scheduler",

        components: {
            clock: {
                // TODO: This should be changed to a custom clock
                // that is driven by Flocking's main audio callback,
                // or at very least change the scheduler to a
                // workerProxy.
                type: "berg.clock.workerSetInterval",
                options: {
                    freq: 100
                }
            }
        }
    });


    fluid.defaults("flock.enviro.withScheduler", {
        gradeNames: ["flock.enviro"],

        components: {
            scheduler: {
                type: "flock.enviroScheduler"
            }
        },

        listeners: {
            "onStart.startScheduler": "{that}.scheduler.start()",
            "onStop.stopScheduler": "{that}.scheduler.stop()",
            "onReset.clearScheduler": "{that}.scheduler.clearAll()"
        }
    });


    /**
     * An environment grade that is configured to always output
     * silence using a Web Audio GainNode. This is useful for unit testing,
     * where failures could produce painful or unexpected output.
     */
    fluid.defaults("flock.silentEnviro", {
        gradeNames: "flock.enviro",

        listeners: {
            "onCreate.insertGainNode": {
                funcName: "flock.silentEnviro.insertOutputGainNode",
                args: "{that}"
            }
        }
    });

    flock.silentEnviro.insertOutputGainNode = function (that) {
        if (that.audioSystem.nativeNodeManager) {
            that.audioSystem.nativeNodeManager.createOutputNode({
                node: "Gain",
                params: {
                    gain: 0
                }
            });
        }
    };
}());
