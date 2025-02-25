// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/**
 * Represents the JSON used in the speech.context message sent to the speech service.
 * The dynamic grammar is always refreshed from the encapsulated dynamic grammar object.
 */
export class SpeechContext {
    constructor(dynamicGrammar) {
        this.privContext = {};
        this.privDynamicGrammar = dynamicGrammar;
    }
    /**
     * Gets a section of the speech.context object.
     * @param sectionName Name of the section to get.
     * @return string or Context JSON serializable object that represents the value.
     */
    getSection(sectionName) {
        return (this.privContext[sectionName] || {});
    }
    /**
     * Adds a section to the speech.context object.
     * @param sectionName Name of the section to add.
     * @param value JSON serializable object that represents the value.
     */
    setSection(sectionName, value) {
        this.privContext[sectionName] = value;
    }
    /**
     * @Internal
     * This is only used by pronunciation assessment config.
     * Do not use externally, object returned will change without warning or notice.
     */
    setPronunciationAssessmentParams(params, contentAssessmentTopic, isSpeakerDiarizationEnabled = false) {
        if (this.privContext.phraseDetection === undefined) {
            this.privContext.phraseDetection = {
                enrichment: {
                    pronunciationAssessment: {}
                }
            };
        }
        if (this.privContext.phraseDetection.enrichment === undefined) {
            this.privContext.phraseDetection.enrichment = {
                pronunciationAssessment: {}
            };
        }
        this.privContext.phraseDetection.enrichment.pronunciationAssessment = JSON.parse(params);
        if (isSpeakerDiarizationEnabled) {
            this.privContext.phraseDetection.mode = "Conversation";
        }
        this.setWordLevelTimings();
        this.privContext.phraseOutput.detailed.options.push("PronunciationAssessment");
        if (this.privContext.phraseOutput.detailed.options.indexOf("SNR") === -1) {
            this.privContext.phraseOutput.detailed.options.push("SNR");
        }
        if (!!contentAssessmentTopic) {
            this.privContext.phraseDetection.enrichment.contentAssessment = {
                topic: contentAssessmentTopic
            };
            this.privContext.phraseOutput.detailed.options.push("ContentAssessment");
        }
    }
    setDetailedOutputFormat() {
        if (this.privContext.phraseOutput === undefined) {
            this.privContext.phraseOutput = {
                detailed: {
                    options: []
                },
                format: {}
            };
        }
        if (this.privContext.phraseOutput.detailed === undefined) {
            this.privContext.phraseOutput.detailed = {
                options: []
            };
        }
        this.privContext.phraseOutput.format = "Detailed";
    }
    setWordLevelTimings() {
        if (this.privContext.phraseOutput === undefined) {
            this.privContext.phraseOutput = {
                detailed: {
                    options: []
                },
                format: {}
            };
        }
        if (this.privContext.phraseOutput.detailed === undefined) {
            this.privContext.phraseOutput.detailed = {
                options: []
            };
        }
        this.privContext.phraseOutput.format = "Detailed";
        if (this.privContext.phraseOutput.detailed.options.indexOf("WordTimings") === -1) {
            this.privContext.phraseOutput.detailed.options.push("WordTimings");
        }
    }
    setSpeakerDiarizationAudioOffsetMs(audioOffsetMs) {
        this.privContext.phraseDetection.speakerDiarization.audioOffsetMs = audioOffsetMs;
    }
    toJSON() {
        const dgi = this.privDynamicGrammar.generateGrammarObject();
        this.setSection("dgi", dgi);
        const ret = JSON.stringify(this.privContext);
        return ret;
    }
}

//# sourceMappingURL=SpeechContext.js.map
