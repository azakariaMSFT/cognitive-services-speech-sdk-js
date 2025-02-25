// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { RecognitionStatus } from "../Exports.js";
export class DetailedSpeechPhrase {
    constructor(json) {
        this.privDetailedSpeechPhrase = JSON.parse(json);
        this.privDetailedSpeechPhrase.RecognitionStatus = RecognitionStatus[this.privDetailedSpeechPhrase.RecognitionStatus];
    }
    static fromJSON(json) {
        return new DetailedSpeechPhrase(json);
    }
    getJsonWithCorrectedOffsets(baseOffset) {
        if (!!this.privDetailedSpeechPhrase.NBest) {
            let firstWordOffset;
            for (const phrase of this.privDetailedSpeechPhrase.NBest) {
                if (!!phrase.Words && !!phrase.Words[0]) {
                    firstWordOffset = phrase.Words[0].Offset;
                    break;
                }
            }
            if (!!firstWordOffset && firstWordOffset < baseOffset) {
                const offset = baseOffset - firstWordOffset;
                for (const details of this.privDetailedSpeechPhrase.NBest) {
                    if (!!details.Words) {
                        for (const word of details.Words) {
                            word.Offset += offset;
                        }
                    }
                    if (!!details.DisplayWords) {
                        for (const word of details.DisplayWords) {
                            word.Offset += offset;
                        }
                    }
                }
            }
        }
        return JSON.stringify(this.privDetailedSpeechPhrase);
    }
    get RecognitionStatus() {
        return this.privDetailedSpeechPhrase.RecognitionStatus;
    }
    get NBest() {
        return this.privDetailedSpeechPhrase.NBest;
    }
    get Duration() {
        return this.privDetailedSpeechPhrase.Duration;
    }
    get Offset() {
        return this.privDetailedSpeechPhrase.Offset;
    }
    get Language() {
        return this.privDetailedSpeechPhrase.PrimaryLanguage === undefined ? undefined : this.privDetailedSpeechPhrase.PrimaryLanguage.Language;
    }
    get LanguageDetectionConfidence() {
        return this.privDetailedSpeechPhrase.PrimaryLanguage === undefined ? undefined : this.privDetailedSpeechPhrase.PrimaryLanguage.Confidence;
    }
    get Text() {
        if (!!this.privDetailedSpeechPhrase.NBest && this.privDetailedSpeechPhrase.NBest[0]) {
            return this.privDetailedSpeechPhrase.NBest[0].Display || this.privDetailedSpeechPhrase.NBest[0].DisplayText;
        }
        return this.privDetailedSpeechPhrase.DisplayText;
    }
    get SpeakerId() {
        return this.privDetailedSpeechPhrase.SpeakerId;
    }
}

//# sourceMappingURL=DetailedSpeechPhrase.js.map
