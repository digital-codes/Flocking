/*
 * Flocking Audio File Decoder Tests
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2012-2017, Colin Clark
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

 /*global fluid, flock, jqUnit*/
 (function () {
    "use strict";

    /*************************************
     * Audio System Merging and Clamping *
     *************************************/

    fluid.defaults("flock.test.audioSystemEnvironment", {
        gradeNames: "fluid.test.testEnvironment",

        components: {
            tester: {
                type: "flock.test.audioSystemTester"
            }
        }
    });

    fluid.defaults("flock.test.audioSystemTester", {
        gradeNames: "fluid.test.testCaseHolder",

        components: {
            audioSystem: {
                createOnEvent: "onCreateAudioSystem",
                type: "flock.audioSystem",
                options: {
                    model: "{arguments}.0"
                }
            }
        },

        events: {
            onCreateAudioSystem: null
        },

        modules: [
            {
                name: "Clamping and merging",
                tests: [
                    {
                        name: "Channel clamping",
                        expect: 1,
                        sequence: [
                            {
                                func: "{that}.events.onCreateAudioSystem.fire",
                                args: [
                                    {
                                        chans: 64,
                                        numInputBuses: 128
                                    }
                                ]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The audio system's number of channels should be clamped correctly",
                                    "{audioSystem}.options.channelRange.max",
                                    "{audioSystem}.model.chans"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Input clamping",
                        expect: 2,
                        sequence: [
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The audioSystem's number of inputs should be clamped correctly",
                                    "{audioSystem}.options.inputBusRange.max",
                                    "{audioSystem}.model.numInputBuses"
                                ]
                            },
                            {
                                funcName: "flock.test.audioSystemTester.assertGreaterOrEqual",
                                args: [
                                    "The audioSystem's number of inputs should be greater than the minimum",
                                    "{audioSystem}.model.numInputBuses",
                                    "{audioSystem}.options.inputBusRange.min",
                                ]
                            }
                        ]
                    },
                    {
                        name: "Bus clamping",
                        expect: 2,
                        sequence: [
                            {
                                func: "{that}.events.onCreateAudioSystem.fire",
                                args: [
                                    {
                                        chans: 1,
                                        numBuses: 1
                                    }
                                ]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The audioSystem should always have more than one bus.",
                                    "{audioSystem}.options.outputBusRange.min",
                                    "{audioSystem}.model.numBuses"
                                ]
                            },
                            {
                                func: "{that}.events.onCreateAudioSystem.fire",
                                args: [
                                    {
                                        chans: 8,
                                        numBuses: 4
                                    }
                                ]
                            },
                            {
                                funcName: "flock.test.audioSystemTester.assertGreaterOrEqual",
                                args: [
                                    "The audioSystem should always have at least as many buses as channels.",
                                    "{audioSystem}.model.numBuses",
                                    "{audioSystem}.model.chans"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Merging",
                        expect: 2,
                        sequence: [
                            {
                                func: "{that}.events.onCreateAudioSystem.fire",
                                args: [
                                    {
                                        chans: 1,
                                        numBuses: 24
                                    }
                                ]
                            },

                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The audioSystem should have been configured with the specified number of channels",
                                    1,
                                    "{audioSystem}.model.chans"
                                ]
                            },

                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The audioSystem should have been configured with the specified number of buses.",
                                    24,
                                    "{audioSystem}.model.numBuses"
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    flock.test.audioSystemTester.assertGreaterOrEqual = function (msg, left, right) {
        jqUnit.assertTrue(msg, left >= right);
    };

    fluid.test.runTests("flock.test.audioSystemEnvironment");
}());
