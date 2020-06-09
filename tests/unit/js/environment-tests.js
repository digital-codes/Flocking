/*
 * Flocking Environment Tests
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2020, Colin Clark
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

 /*global fluid*/
 (function () {
    "use strict";

    fluid.defaults("flock.test.enviroTestEnvironment", {
        gradeNames: "fluid.test.testEnvironment",

        components: {
            tester: {
                type: "flock.test.enviroTester"
            }
        }
    });

    fluid.defaults("flock.test.enviroTester", {
        gradeNames: "fluid.test.testCaseHolder",

        components: {
            enviro: {
                createOnEvent: "onCreateEnviro",
                type: "flock.silentEnviro",
                options: {
                    components: {
                        audioSystem: {
                            options: {
                                model: "{arguments}.0"
                            }
                        }
                    }
                }
            }
        },

        events: {
            onCreateEnviro: null
        },

        modules: [
            {
                name: "Environment creation tests",
                tests: [
                    {
                        name: "Bus creation",
                        expect: 2,
                        sequence: [
                            {
                                func: "{that}.events.onCreateEnviro.fire",
                                args: [
                                    {
                                        numBuses: 24
                                    }
                                ]
                            },
                            {
                                func: "jqUnit.assertEquals",
                                args: [
                                    "The environment should actually have the specified number of buses.",
                                    24,
                                    "{enviro}.busManager.buses.length"
                                ]
                            },
                            {
                                func: "{that}.events.onCreateEnviro.fire",
                                args: [
                                    {
                                        numBuses: 2
                                    }
                                ]
                            },
                            {
                                func: "jqUnit.assertEquals",
                                args: [
                                    "The environment should actually have the specified number of buses.",
                                    2,
                                    "{enviro}.busManager.buses.length"
                                ]
                            },
                        ]
                    }
                ]
            }
        ]
    });

    fluid.test.runTests("flock.test.enviroTestEnvironment");
}());
