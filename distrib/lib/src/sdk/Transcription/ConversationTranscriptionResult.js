// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { RecognitionResult } from "../Exports.js";
/**
 * Defines result of conversation transcription.
 * @class ConversationTranscriptionResult
 */
export class ConversationTranscriptionResult extends RecognitionResult {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @public
     * @param {string} resultId - The result id.
     * @param {ResultReason} reason - The reason.
     * @param {string} text - The recognized text.
     * @param {number} duration - The duration.
     * @param {number} offset - The offset into the stream.
     * @param {string} language - Primary Language detected, if provided.
     * @param {string} languageDetectionConfidence - Primary Language confidence ("Unknown," "Low," "Medium," "High"...), if provided.
     * @param {string} speakerId - speaker id for conversation transcription.
     * @param {string} errorDetails - Error details, if provided.
     * @param {string} json - Additional Json, if provided.
     * @param {PropertyCollection} properties - Additional properties, if provided.
     */
    constructor(resultId, reason, text, duration, offset, language, languageDetectionConfidence, speakerId, errorDetails, json, properties) {
        super(resultId, reason, text, duration, offset, language, languageDetectionConfidence, errorDetails, json, properties);
        this.privSpeakerId = speakerId;
    }
    /**
     * speaker id
     * @member ConversationTranscriptionResult.prototype.speakerId
     * @function
     * @public
     * @returns {string} id of speaker in given result
     */
    get speakerId() {
        return this.privSpeakerId;
    }
}

//# sourceMappingURL=ConversationTranscriptionResult.js.map
