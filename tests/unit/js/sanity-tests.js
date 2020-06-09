/*
 * Flocking Sanity Tests
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2020, Colin Clark
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

 /*global fluid*/

 (function () {
    "use strict";

    fluid.defaults("flock.test.sanityTestEnvironment", {
        gradeNames: "flock.test.testEnvironment",

        components: {
            tester: {
                type: "flock.test.sanityTester"
            }
        }
    });

    fluid.defaults("flock.test.sanityTester", {
        gradeNames: "fluid.test.testCaseHolder",

        modules: [
            {
                name: "Basic test sanity",
                tests: [
                    {
                        name: "Equality",
                        expect: 1,
                        sequence: [
                            {
                                func: "jqUnit.assertDeepEq",
                                args: [
                                    "Two objects should be deep equal.",
                                    {cat: "meow"},
                                    {cat: "meow"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    fluid.test.runTests("flock.test.sanityTestEnvironment");
}());
