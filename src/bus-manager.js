/*
 * Flocking Bus Manager
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2011-2020, Colin Clark
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */

 /*global fluid, flock*/
 (function () {

    "use strict";

    // TODO: Refactor how buses work so that they're clearly
    // delineated into types--input, output, and interconnect.
    // TODO: Get rid of the concept of buses altogether.
    fluid.defaults("flock.busManager", {
        gradeNames: ["fluid.modelComponent"],

        model: {
            nextAvailableBus: {
                input: 0,
                interconnect: 0
            }
        },

        members: {
            buses: []
        },

        invokers: {
            acquireNextBus: {
                funcName: "flock.busManager.acquireNextBus",
                args: [
                    "{arguments}.0", // The type of bus, either "input" or "interconnect".
                    "{that}.buses",
                    "{that}.applier",
                    "{that}.model",
                    "{enviro}.audioSystem.model.chans",
                    "{enviro}.audioSystem.model.numInputBuses"
                ]
            },

            reset: {
                changePath: "nextAvailableBus",
                value: {
                    input: 0,
                    interconnect: 0
                }
            }
        },

        listeners: {
            "onCreate.initBuses": {
                funcName: "flock.busManager.createAudioBuffers",
                args: [
                    "{that}.buses",
                    "{enviro}.audioSystem.model.numBuses",
                    "{enviro}.audioSystem.model.blockSize"
                ]
            }
        }
    });

    flock.busManager.createAudioBuffers = function (bufs, numBufs, blockSize) {
        bufs = bufs || [];

        for (var i = 0; i < numBufs; i++) {
            bufs[i] = new Float32Array(blockSize);
        }
        return bufs;
    };

    flock.busManager.acquireNextBus = function (type, buses, applier, m, chans, numInputBuses) {
        var busNum = m.nextAvailableBus[type];

        if (busNum === undefined) {
            flock.fail("An invalid bus type was specified when invoking " +
                "flock.busManager.acquireNextBus(). Type was: " + type);
            return;
        }

        // Input buses start immediately after the output buses.
        var offsetBusNum = busNum + chans,
            offsetBusMax = chans + numInputBuses;

        // Interconnect buses are after the input buses.
        if (type === "interconnect") {
            offsetBusNum += numInputBuses;
            offsetBusMax = buses.length;
        }

        if (offsetBusNum >= offsetBusMax) {
            flock.fail("Unable to aquire a bus. There are insufficient buses available. " +
                "Please use an existing bus or configure additional buses using the enviroment's " +
                "numBuses and numInputBuses parameters.");
            return;
        }

        applier.change("nextAvailableBus." + type, ++busNum);

        return offsetBusNum;
    };
}());
