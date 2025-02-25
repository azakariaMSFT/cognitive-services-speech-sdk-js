// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CancellationErrorCode, OutputFormat, PropertyCollection, PropertyId, ResultReason, SpeechRecognitionCanceledEventArgs, SpeechRecognitionEventArgs, SpeechRecognitionResult, } from "../sdk/Exports.js";
import { CancellationErrorCodePropertyName, DetailedSpeechPhrase, EnumTranslation, OutputFormatPropertyName, RecognitionStatus, ServiceRecognizerBase, SimpleSpeechPhrase, SpeechHypothesis, } from "./Exports.js";
// eslint-disable-next-line max-classes-per-file
export class SpeechServiceRecognizer extends ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, speechRecognizer) {
        super(authentication, connectionFactory, audioSource, recognizerConfig, speechRecognizer);
        this.privSpeechRecognizer = speechRecognizer;
    }
    processTypeSpecificMessages(connectionMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            const resultProps = new PropertyCollection();
            resultProps.setProperty(PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
            let processed = false;
            switch (connectionMessage.path.toLowerCase()) {
                case "speech.hypothesis":
                case "speech.fragment":
                    const hypothesis = SpeechHypothesis.fromJSON(connectionMessage.textBody);
                    const offset = hypothesis.Offset + this.privRequestSession.currentTurnAudioOffset;
                    result = new SpeechRecognitionResult(this.privRequestSession.requestId, ResultReason.RecognizingSpeech, hypothesis.Text, hypothesis.Duration, offset, hypothesis.Language, hypothesis.LanguageDetectionConfidence, undefined, // Speaker Id
                    undefined, connectionMessage.textBody, resultProps);
                    this.privRequestSession.onHypothesis(offset);
                    const ev = new SpeechRecognitionEventArgs(result, hypothesis.Duration, this.privRequestSession.sessionId);
                    if (!!this.privSpeechRecognizer.recognizing) {
                        try {
                            this.privSpeechRecognizer.recognizing(this.privSpeechRecognizer, ev);
                            /* eslint-disable no-empty */
                        }
                        catch (error) {
                            // Not going to let errors in the event handler
                            // trip things up.
                        }
                    }
                    processed = true;
                    break;
                case "speech.phrase":
                    const simple = SimpleSpeechPhrase.fromJSON(connectionMessage.textBody);
                    const resultReason = EnumTranslation.implTranslateRecognitionResult(simple.RecognitionStatus, this.privExpectContentAssessmentResponse);
                    this.privRequestSession.onPhraseRecognized(this.privRequestSession.currentTurnAudioOffset + simple.Offset + simple.Duration);
                    if (ResultReason.Canceled === resultReason) {
                        const cancelReason = EnumTranslation.implTranslateCancelResult(simple.RecognitionStatus);
                        const cancellationErrorCode = EnumTranslation.implTranslateCancelErrorCode(simple.RecognitionStatus);
                        yield this.cancelRecognitionLocal(cancelReason, cancellationErrorCode, EnumTranslation.implTranslateErrorDetails(cancellationErrorCode));
                    }
                    else {
                        if (!(this.privRequestSession.isSpeechEnded && resultReason === ResultReason.NoMatch && simple.RecognitionStatus !== RecognitionStatus.InitialSilenceTimeout)) {
                            if (this.privRecognizerConfig.parameters.getProperty(OutputFormatPropertyName) === OutputFormat[OutputFormat.Simple]) {
                                result = new SpeechRecognitionResult(this.privRequestSession.requestId, resultReason, simple.DisplayText, simple.Duration, simple.Offset + this.privRequestSession.currentTurnAudioOffset, simple.Language, simple.LanguageDetectionConfidence, undefined, // Speaker Id
                                undefined, connectionMessage.textBody, resultProps);
                            }
                            else {
                                const detailed = DetailedSpeechPhrase.fromJSON(connectionMessage.textBody);
                                const totalOffset = detailed.Offset + this.privRequestSession.currentTurnAudioOffset;
                                const offsetCorrectedJson = detailed.getJsonWithCorrectedOffsets(totalOffset);
                                result = new SpeechRecognitionResult(this.privRequestSession.requestId, resultReason, detailed.RecognitionStatus === RecognitionStatus.Success ? detailed.NBest[0].Display : undefined, detailed.Duration, totalOffset, detailed.Language, detailed.LanguageDetectionConfidence, undefined, // Speaker Id
                                undefined, offsetCorrectedJson, resultProps);
                            }
                            const event = new SpeechRecognitionEventArgs(result, result.offset, this.privRequestSession.sessionId);
                            if (!!this.privSpeechRecognizer.recognized) {
                                try {
                                    this.privSpeechRecognizer.recognized(this.privSpeechRecognizer, event);
                                    /* eslint-disable no-empty */
                                }
                                catch (error) {
                                    // Not going to let errors in the event handler
                                    // trip things up.
                                }
                            }
                        }
                        if (!!this.privSuccessCallback) {
                            try {
                                this.privSuccessCallback(result);
                            }
                            catch (e) {
                                if (!!this.privErrorCallback) {
                                    this.privErrorCallback(e);
                                }
                            }
                            // Only invoke the call back once.
                            // and if it's successful don't invoke the
                            // error after that.
                            this.privSuccessCallback = undefined;
                            this.privErrorCallback = undefined;
                        }
                    }
                    processed = true;
                    break;
                default:
                    break;
            }
            return processed;
        });
    }
    // Cancels recognition.
    cancelRecognition(sessionId, requestId, cancellationReason, errorCode, error) {
        const properties = new PropertyCollection();
        properties.setProperty(CancellationErrorCodePropertyName, CancellationErrorCode[errorCode]);
        if (!!this.privSpeechRecognizer.canceled) {
            const cancelEvent = new SpeechRecognitionCanceledEventArgs(cancellationReason, error, errorCode, undefined, sessionId);
            try {
                this.privSpeechRecognizer.canceled(this.privSpeechRecognizer, cancelEvent);
                /* eslint-disable no-empty */
            }
            catch (_a) { }
        }
        if (!!this.privSuccessCallback) {
            const result = new SpeechRecognitionResult(requestId, ResultReason.Canceled, undefined, // Text
            undefined, // Duration
            undefined, // Offset
            undefined, // Language
            undefined, // Language Detection Confidence
            undefined, // Speaker Id
            error, undefined, // Json
            properties);
            try {
                this.privSuccessCallback(result);
                this.privSuccessCallback = undefined;
                /* eslint-disable no-empty */
            }
            catch (_b) { }
        }
    }
}

//# sourceMappingURL=SpeechServiceRecognizer.js.map
