/*
 * Flocking Composition
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2020, Colin Clark
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */

 /*global fluid*/

 (function () {
    "use strict";

    /**
     * A component designed to be the root of a whole Flocking "application",
     * which is reponsible for ensuring that Flocking Environment has been
     * and is distributed to any appropriate child components who need it.
     */
    fluid.defaults("flock.composition", {
        gradeNames: "fluid.component",

        distributeOptions: [
            {
                record: {
                    enviro: "{composition}.enviro"
                },

                target: "{that flock.environmentHolder}.options.components"
            }
        ],

        components: {
            enviro: {
                type: "flock.enviro"
            }
        }
    });
}());
