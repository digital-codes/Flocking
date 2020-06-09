/*!
* Flocking Audio File Decoder Tests
* https://github.com/colinbdclark/flocking
*
* Copyright 2012-2017, Colin Clark
* Dual licensed under the MIT or GPL Version 2 licenses.
*/

/*global require*/

var fluid = fluid || require("infusion"),
    jqUnit = jqUnit || fluid.require("node-jqunit"),
    flock = fluid.registerNamespace("flock");

(function () {
    "use strict";

    fluid.registerNamespace("flock.test");

    // TODO: Generalize and promote this to a core component?
    fluid.defaults("flock.test.audioBufferDataURLReader", {
        gradeNames: "fluid.component",

        invokers: {
            read: {
                funcName: "flock.test.audioBufferDataURLReader.read",
                args: [
                    "{arguments}.0", // src
                    "{arguments}.1", // format
                    "{that}"
                ]
            }
        },

        events: {
            afterRead: null,
            afterDecoded: null
        },

        listeners: {
            "afterRead.decode": {
                funcName: "flock.test.audioBufferDataURLReader.decode",
                args: [
                    "{arguments}.0", // data buffer
                    "{arguments}.1", // format
                    "{that}"
                ]
            }
        }
    });

    flock.test.audioBufferDataURLReader.read = function (src, format, that) {
        flock.file.readBufferFromDataUrl({
            src: src,
            success: function (dataBuffer) {
                that.events.afterRead.fire(dataBuffer, format);
            }
        });
    };

    flock.test.audioBufferDataURLReader.decode = function (dataBuffer, format, that) {
        var decoded = flock.audio.decode.chunked(dataBuffer,
            flock.audio.formats[format]);

        that.events.afterDecoded.fire(decoded);
    };

    fluid.defaults("flock.test.audioFileDecoderTestEnvironment", {
        gradeNames: "flock.test.testEnvironment",

        components: {
            decoder: {
                type: "flock.test.audioBufferDataURLReader"
            },

            tester: {
                type: "flock.test.audioFileDecoderTester"
            }
        }
    });

    fluid.defaults("flock.test.audioFileDecoderTester", {
        gradeNames: "fluid.test.testCaseHolder",

        modules: [
            {
                name: "flock.audio.decode.chunked() tests",
                tests: [
                    {
                        name: "int 16 WAV file",
                        expect: 1,
                        sequence: [
                            {
                                func: "{decoder}.read",
                                args: [
                                    flock.test.audio.triangleInt16WAV,
                                    "wav"
                                ]
                            },
                            {
                                event: "{decoder}.events.afterDecoded",
                                listener: "flock.test.audioFileDecoderTester.testDecodedFileInfo",
                                args: [
                                    "{arguments}.0",
                                    {
                                        container: {
                                            id: "RIFF",
                                            size: 120,
                                            formatType: "WAVE"
                                        },
                                        format: {
                                            id: "fmt ",
                                            size: 16,
                                            audioFormatType: 1,
                                            numChannels: 1,
                                            numSampleFrames: 42,
                                            sampleRate: 44100,
                                            avgBytesPerSecond: 88200,
                                            blockAlign: 2,
                                            duration: 0.0009523809523809524,
                                            bitRate: 16
                                        },
                                        data: {
                                            id: "data",
                                            size: 84
                                        }
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        name: "16 bit AIFF file",
                        expect: 1,
                        sequence: [
                            {
                                func: "{decoder}.read",
                                args: [
                                    flock.test.audio.triangleInt16AIFF,
                                    "aiff"
                                ]
                            },
                            {
                                event: "{decoder}.events.afterDecoded",
                                listener: "flock.test.audioFileDecoderTester.testDecodedFileInfo",
                                args: [
                                    "{arguments}.0",
                                    {
                                        container: {
                                            id: "FORM",
                                            size: 130,
                                            formatType: "AIFF"
                                        },
                                        format: {
                                            id: "COMM",
                                            size: 18,
                                            numChannels: 1,
                                            numSampleFrames: 42,
                                            bitRate: 16,
                                            duration: 0.0009523809523809524,
                                            sampleRate: 44100.0
                                        },
                                        data: {
                                            id: "SSND",
                                            size: 92,
                                            offset: 0,
                                            blockSize: 0
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    flock.test.audioFileDecoderTester.testDecodedFileInfo = function (actual, expected) {
        // TODO: Use the correct jqUnit tester for this.
        delete actual.data.channels;

        jqUnit.assertDeepEq("The decoded audio file info should contain valid container, format, and data structures.", expected, actual);
    };

    fluid.test.runTests("flock.test.audioFileDecoderTestEnvironment");

    var eightBitSampleSize = 42;
    var decoderTestSpecs = [
        {
            name: "int 16 WAV file",
            bitDepth: 16,
            dataSize: eightBitSampleSize * 2,
            src: flock.test.audio.triangleInt16WAV
        },
        {
            name: "int 16 AIFF file",
            bitDepth: 16,
            dataSize: (eightBitSampleSize * 2) + 4 + 4, // 42 samples in 16 bit representation plus 4 bytes for offset and 4 for blockSize
            src: flock.test.audio.triangleInt16AIFF
        },
        {
            name: "int8 AIFF file",
            bitDepth: 8,
            dataSize: eightBitSampleSize + 4 + 4,
            src: flock.test.audio.triangleInt8AIFF
        },
        {
            name: "int32 WAV file",
            bitDepth: 32,
            dataSize: eightBitSampleSize * 4,
            src: flock.test.audio.triangleInt32WAV,
            decoder: flock.audio.decode.sync
        },
        {
            name: "int32 AIFF file",
            bitDepth: 32,
            dataSize: (eightBitSampleSize * 4) + 4 + 4,
            src: flock.test.audio.triangleInt32AIFF,
            decoder: flock.audio.decode.sync

        },
        {
            name: "float WAV file",
            bitDepth: 32,
            dataSize: eightBitSampleSize * 4,
            src: flock.test.audio.triangleFloatWAV,
            decoder: flock.audio.decode.sync
        },
        {
            name: "float AIFF file",
            bitDepth: 32,
            dataSize: (eightBitSampleSize * 4) + 4 + 4,
            src: flock.test.audio.triangleFloatAIFF,
            decoder: flock.audio.decode.sync
        }
    ];

    var module = flock.test.module({
        name: "flock.audio.decode() mixed decoder tests"
    });

    flock.test.audioFile.testDecoder(decoderTestSpecs, module);

    var specifyDecoderType = function (decoderType, specs) {
        var typedSpecs = fluid.copy(specs);
        fluid.each(typedSpecs, function (spec) {
            spec.decoder = decoderType;
        });

        return typedSpecs;
    };

    module = flock.test.module({
        name: "flock.audio.decode() pure JavaScript sync decoder tests"
    });

    flock.test.audioFile.testDecoder(specifyDecoderType(flock.audio.decode.sync,
        decoderTestSpecs), module);

    module = flock.test.module({
        name: "flock.audio.decode() pure JavaScript async decoder tests"
    });

    flock.test.audioFile.testDecoder(specifyDecoderType(flock.audio.decode.workerAsync,
        decoderTestSpecs), module);
}());
