/*global fluid*/

fluid.defaults("flock.demo.simpleSynth", {
    gradeNames: "fluid.component",

    components: {
        enviro: {
            type: "flock.enviro"
        },

        playButton: {
            type: "flock.ui.enviroPlayButton",
            container: "#play"
        },

        synth: {
            type: "flock.synth",
            options: {
                synthDef: {
                    ugen: "flock.ugen.sinOsc",
                    freq: 220,
                    mul: 0.5
                }
            }
        }
    }
});
