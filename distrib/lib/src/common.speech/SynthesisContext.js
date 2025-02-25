// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { PropertyId } from "../sdk/Exports.js";
/**
 * Represents the JSON used in the synthesis.context message sent to the speech service.
 * The dynamic grammar is always refreshed from the encapsulated dynamic grammar object.
 */
export class SynthesisContext {
    constructor() {
        this.privContext = {};
    }
    /**
     * Adds a section to the synthesis.context object.
     * @param sectionName Name of the section to add.
     * @param value JSON serializable object that represents the value.
     */
    setSection(sectionName, value) {
        this.privContext[sectionName] = value;
    }
    /**
     * Sets the audio output format for synthesis context generation.
     * @param format {AudioOutputFormatImpl} the output format
     */
    set audioOutputFormat(format) {
        this.privAudioOutputFormat = format;
    }
    toJSON() {
        return JSON.stringify(this.privContext);
    }
    setSynthesisSection(speechSynthesizer) {
        const synthesisSection = this.buildSynthesisContext(speechSynthesizer);
        this.setSection("synthesis", synthesisSection);
    }
    buildSynthesisContext(speechSynthesizer) {
        return {
            audio: {
                metadataOptions: {
                    bookmarkEnabled: (!!(speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.bookmarkReached)),
                    punctuationBoundaryEnabled: speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.properties.getProperty(PropertyId.SpeechServiceResponse_RequestPunctuationBoundary, (!!(speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.wordBoundary))),
                    sentenceBoundaryEnabled: speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.properties.getProperty(PropertyId.SpeechServiceResponse_RequestSentenceBoundary, false),
                    sessionEndEnabled: true,
                    visemeEnabled: (!!(speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.visemeReceived)),
                    wordBoundaryEnabled: speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.properties.getProperty(PropertyId.SpeechServiceResponse_RequestWordBoundary, (!!(speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.wordBoundary))),
                },
                outputFormat: this.privAudioOutputFormat.requestAudioFormatString,
            },
            language: {
                autoDetection: speechSynthesizer === null || speechSynthesizer === void 0 ? void 0 : speechSynthesizer.autoDetectSourceLanguage
            }
        };
    }
}

//# sourceMappingURL=SynthesisContext.js.map
