/*global fluid*/

fluid.defaults("flock.test.environmentCreator", {
    gradeNames: "fluid.component",

    components: {
        enviro: {
            type: "flock.enviro"
        },

        playButton: {
            type: "flock.ui.enviroPlayButton",
            container: "#play"
        }
    }
});
