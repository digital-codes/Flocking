/*
 * Flocking Node
 * https://github.com/colinbdclark/flocking
 *
 * Copyright 2011-2020, Colin Clark
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */

 /*global fluid, flock*/

 (function () {
    "use strict";
    fluid.defaults("flock.node", {
        gradeNames: ["flock.autoEnviro", "fluid.modelComponent"],

        addToEnvironment: "tail",

        model: {},

        members: {
            generatorFunc: "@expand:fluid.getGlobalValue({that}.options.invokers.generate.funcName)"
        },

        components: {
            enviro: "{flock.enviro}"
        },

        invokers: {
            /**
             * Plays the node. This is a convenience method that will add the
             * node to the tail of the environment's node graph and then play
             * the environmnent.
             *
             * @param {Number} dur optional duration to play this synth in seconds
             */
            play: {
                funcName: "flock.node.play",
                args: ["{that}", "{that}.enviro", "{that}.addToEnvironment"]
            },

            /**
             * Stops the synth if it is currently playing.
             * This is a convenience method that will remove the synth from the environment's node graph.
             */
            pause: "{that}.removeFromEnvironment()",

            /**
             * Adds the node to its environment's list of active nodes.
             *
             * @param {String || Boolean || Number} position the place to insert the node at;
             *     if undefined, the node's addToEnvironment option will be used.
             */
            addToEnvironment: {
                funcName: "flock.node.addToEnvironment",
                args: ["{that}", "{arguments}.0", "{that}.enviro.nodeList"]
            },

            /**
             * Removes the node from its environment's list of active nodes.
             */
            removeFromEnvironment: {
                funcName: "flock.node.removeFromEnvironment",
                args: ["{that}", "{that}.enviro.nodeList"]
            },

            /**
             * Returns a boolean describing if this node is currently
             * active in its environment's list of nodes
             * (i.e. if it is currently generating samples).
             */
            isPlaying: {
                funcName: "flock.nodeList.isNodeActive",
                args:["{that}.enviro.nodeList", "{that}"]
            },

            generate: {
                funcName: "fluid.identity"
            }
        },

        listeners: {
            "onCreate.addToEnvironment": {
                func: "{that}.addToEnvironment",
                args: ["{that}.options.addToEnvironment"]
            },

            "onDestroy.removeFromEnvironment": {
                func: "{that}.removeFromEnvironment"
            }
        }
    });

    flock.node.addToEnvironment = function (node, position, nodeList) {
        if (position === undefined) {
            position = node.options.addToEnvironment;
        }

        // Add this node to the tail of the synthesis environment if appropriate.
        if (position === undefined || position === null || position === false) {
            return;
        }

        var type = typeof (position);
        if (type === "string" && position === "head" || position === "tail") {
            flock.nodeList[position](nodeList, node);
        } else if (type === "number") {
            flock.nodeList.insert(nodeList, node, position);
        } else {
            flock.nodeList.tail(nodeList, node);
        }
    };

    flock.node.removeFromEnvironment = function (node, nodeList) {
        flock.nodeList.remove(nodeList, node);
    };

    flock.node.play = function (node, enviro, addToEnviroFn) {
        if (enviro.nodeList.nodes.indexOf(node) === -1) {
            var position = node.options.addToEnvironment || "tail";
            addToEnviroFn(position);
        }

        // TODO: This behaviour is confusing
        // since calling mySynth.play() will cause
        // all synths in the environment to be played.
        // This functionality should be removed.
        if (!enviro.model.isPlaying) {
            enviro.play();
        }
    };

}());
