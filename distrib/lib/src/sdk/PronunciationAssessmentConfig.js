// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { Contracts } from "./Contracts.js";
import { PronunciationAssessmentGradingSystem, PronunciationAssessmentGranularity, PropertyCollection, PropertyId } from "./Exports.js";
/**
 * Pronunciation assessment configuration.
 * @class PronunciationAssessmentConfig
 * Added in version 1.15.0.
 */
export class PronunciationAssessmentConfig {
    /**
     * PronunciationAssessmentConfig constructor.
     * @constructor
     * @param {string} referenceText
     * @param gradingSystem
     * @param granularity
     * @param enableMiscue
     */
    constructor(referenceText, gradingSystem = PronunciationAssessmentGradingSystem.FivePoint, granularity = PronunciationAssessmentGranularity.Phoneme, enableMiscue = false) {
        Contracts.throwIfNullOrUndefined(referenceText, "referenceText");
        this.privProperties = new PropertyCollection();
        this.privProperties.setProperty(PropertyId.PronunciationAssessment_ReferenceText, referenceText);
        this.privProperties.setProperty(PropertyId.PronunciationAssessment_GradingSystem, PronunciationAssessmentGradingSystem[gradingSystem]);
        this.privProperties.setProperty(PropertyId.PronunciationAssessment_Granularity, PronunciationAssessmentGranularity[granularity]);
        this.privProperties.setProperty(PropertyId.PronunciationAssessment_EnableMiscue, String(enableMiscue));
    }
    /**
     * @member PronunciationAssessmentConfig.fromJSON
     * @function
     * @public
     * @param {string} json The json string containing the pronunciation assessment parameters.
     * @return {PronunciationAssessmentConfig} Instance of PronunciationAssessmentConfig
     * @summary Creates an instance of the PronunciationAssessmentConfig from json.
     * This method is designed to support the pronunciation assessment parameters still in preview.
     * Under normal circumstances, use the constructor instead.
     */
    static fromJSON(json) {
        Contracts.throwIfNullOrUndefined(json, "json");
        const config = new PronunciationAssessmentConfig("");
        config.privProperties = new PropertyCollection();
        config.properties.setProperty(PropertyId.PronunciationAssessment_Json, json);
        return config;
    }
    toJSON() {
        this.updateJson();
        return this.privProperties.getProperty(PropertyId.PronunciationAssessment_Params);
    }
    applyTo(recognizer) {
        this.updateJson();
        const recoBase = recognizer.internalData;
        recoBase.expectContentAssessmentResponse = !!this.privContentAssessmentTopic;
        recoBase.speechContext.setPronunciationAssessmentParams(this.properties.getProperty(PropertyId.PronunciationAssessment_Params), this.privContentAssessmentTopic, recoBase.isSpeakerDiarizationEnabled);
    }
    /**
     * Gets the reference text.
     * @member PronunciationAssessmentConfig.prototype.referenceText
     * @function
     * @public
     * @returns {string} Reference text.
     */
    get referenceText() {
        return this.properties.getProperty(PropertyId.PronunciationAssessment_ReferenceText);
    }
    /**
     * Gets/Sets the reference text.
     * @member PronunciationAssessmentConfig.prototype.referenceText
     * @function
     * @public
     * @param {string} referenceText - Reference text.
     */
    set referenceText(referenceText) {
        Contracts.throwIfNullOrWhitespace(referenceText, "referenceText");
        this.properties.setProperty(PropertyId.PronunciationAssessment_ReferenceText, referenceText);
    }
    /**
     * Sets the phoneme alphabet.
     * The valid values are "SAPI" (default) and "IPA".
     * Added in version 1.20.0
     * @member PronunciationAssessmentConfig.prototype.phonemeAlphabet
     * @function
     * @public
     * @param {string} phonemeAlphabet - Phoneme alphabet.
     */
    set phonemeAlphabet(phonemeAlphabet) {
        Contracts.throwIfNullOrWhitespace(phonemeAlphabet, "phonemeAlphabet");
        this.privPhonemeAlphabet = phonemeAlphabet;
    }
    /**
     * Sets the boolean enableMiscue property.
     * Added in version 1.26.0
     * @member PronunciationAssessmentConfig.prototype.enableMiscue
     * @function
     * @public
     * @param {boolean} enableMiscue - enable miscue.
     */
    set enableMiscue(enableMiscue) {
        const enableMiscueString = enableMiscue ? "true" : "false";
        this.properties.setProperty(PropertyId.PronunciationAssessment_EnableMiscue, enableMiscueString);
    }
    /**
     * Gets the boolean enableMiscue property.
     * Added in version 1.26.0
     * @member PronunciationAssessmentConfig.prototype.enableMiscue
     * @function
     * @public
     * @return {boolean} enableMiscue - enable miscue.
     */
    get enableMiscue() {
        const enableMiscueString = this.properties.getProperty(PropertyId.PronunciationAssessment_EnableMiscue, "false");
        return (enableMiscueString.toLowerCase() === "true");
    }
    /**
     * Sets the nbest phoneme count
     * Added in version 1.20.0
     * @member PronunciationAssessmentConfig.prototype.nbestPhonemeCount
     * @function
     * @public
     * @param {number} nbestPhonemeCount - NBest phoneme count.
     */
    set nbestPhonemeCount(nbestPhonemeCount) {
        this.privNBestPhonemeCount = nbestPhonemeCount;
    }
    /**
     * Enables the prosody assessment.
     * Added in version 1.34.0
     * @member PronunciationAssessmentConfig.prototype.enableProsodyAssessment
     * @function
     * @public
     * @param {boolean} enableProsodyAssessment - enable prosody assessment.
     */
    set enableProsodyAssessment(enableProsodyAssessment) {
        this.privEnableProsodyAssessment = enableProsodyAssessment;
    }
    /**
     * Enables content assessment and sets the topic.
     * Added in version 1.34.0
     * @member PronunciationAssessmentConfig.prototype.enableContentAssessmentWithTopic
     * @function
     * @public
     * @param {string} topic - Topic for content assessment.
     */
    enableContentAssessmentWithTopic(topic) {
        this.privContentAssessmentTopic = topic;
    }
    /**
     * @member PronunciationAssessmentConfig.prototype.properties
     * @function
     * @public
     * @return {PropertyCollection} Properties of the config.
     * @summary Gets a pronunciation assessment config properties
     */
    get properties() {
        return this.privProperties;
    }
    updateJson() {
        const jsonString = this.privProperties.getProperty(PropertyId.PronunciationAssessment_Json, "{}");
        const paramsJson = JSON.parse(jsonString);
        const referenceText = this.privProperties.getProperty(PropertyId.PronunciationAssessment_ReferenceText);
        if (referenceText) {
            paramsJson.referenceText = referenceText;
        }
        const gradingSystem = this.privProperties.getProperty(PropertyId.PronunciationAssessment_GradingSystem);
        if (gradingSystem) {
            paramsJson.gradingSystem = gradingSystem;
        }
        const granularity = this.privProperties.getProperty(PropertyId.PronunciationAssessment_Granularity);
        if (granularity) {
            paramsJson.granularity = granularity;
        }
        if (this.privPhonemeAlphabet) {
            paramsJson.phonemeAlphabet = this.privPhonemeAlphabet;
        }
        if (this.privNBestPhonemeCount) {
            paramsJson.nbestPhonemeCount = this.privNBestPhonemeCount;
        }
        paramsJson.enableProsodyAssessment = this.privEnableProsodyAssessment;
        // always set dimension to Comprehensive
        paramsJson.dimension = "Comprehensive";
        const enableMiscueString = this.privProperties.getProperty(PropertyId.PronunciationAssessment_EnableMiscue);
        if (enableMiscueString) {
            paramsJson.enableMiscue = this.enableMiscue;
        }
        this.privProperties.setProperty(PropertyId.PronunciationAssessment_Params, JSON.stringify(paramsJson));
    }
}

//# sourceMappingURL=PronunciationAssessmentConfig.js.map
