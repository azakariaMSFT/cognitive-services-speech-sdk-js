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
import { createNoDashGuid, Deferred, Events } from "../common/Exports.js";
import { ConnectingToServiceEvent, ListeningStartedEvent, RecognitionStartedEvent, RecognitionTriggeredEvent, } from "./RecognitionEvents.js";
import { ServiceTelemetryListener } from "./ServiceTelemetryListener.Internal.js";
export class RequestSession {
    constructor(audioSourceId) {
        this.privIsDisposed = false;
        this.privDetachables = new Array();
        this.privIsAudioNodeDetached = false;
        this.privIsRecognizing = false;
        this.privIsSpeechEnded = false;
        this.privTurnStartAudioOffset = 0;
        this.privLastRecoOffset = 0;
        this.privHypothesisReceived = false;
        this.privBytesSent = 0;
        this.privRecognitionBytesSent = 0;
        this.privRecogNumber = 0;
        this.privInTurn = false;
        this.privConnectionAttempts = 0;
        this.privAudioSourceId = audioSourceId;
        this.privRequestId = createNoDashGuid();
        this.privAudioNodeId = createNoDashGuid();
        this.privTurnDeferral = new Deferred();
        // We're not in a turn, so resolve.
        this.privTurnDeferral.resolve();
    }
    get sessionId() {
        return this.privSessionId;
    }
    get requestId() {
        return this.privRequestId;
    }
    get audioNodeId() {
        return this.privAudioNodeId;
    }
    get turnCompletionPromise() {
        return this.privTurnDeferral.promise;
    }
    get isSpeechEnded() {
        return this.privIsSpeechEnded;
    }
    get isRecognizing() {
        return this.privIsRecognizing;
    }
    get currentTurnAudioOffset() {
        return this.privTurnStartAudioOffset;
    }
    get recogNumber() {
        return this.privRecogNumber;
    }
    get numConnectionAttempts() {
        return this.privConnectionAttempts;
    }
    // The number of bytes sent for the current connection.
    // Counter is reset to 0 each time a connection is established.
    get bytesSent() {
        return this.privBytesSent;
    }
    // The number of bytes sent for the current recognition.
    // Counter is reset to 0 each time recognition is started.
    get recognitionBytesSent() {
        return this.privRecognitionBytesSent;
    }
    listenForServiceTelemetry(eventSource) {
        if (!!this.privServiceTelemetryListener) {
            this.privDetachables.push(eventSource.attachListener(this.privServiceTelemetryListener));
        }
    }
    startNewRecognition() {
        this.privRecognitionBytesSent = 0;
        this.privIsSpeechEnded = false;
        this.privIsRecognizing = true;
        this.privTurnStartAudioOffset = 0;
        this.privLastRecoOffset = 0;
        this.privRecogNumber++;
        this.privServiceTelemetryListener = new ServiceTelemetryListener(this.privRequestId, this.privAudioSourceId, this.privAudioNodeId);
        this.onEvent(new RecognitionTriggeredEvent(this.requestId, this.privSessionId, this.privAudioSourceId, this.privAudioNodeId));
    }
    onAudioSourceAttachCompleted(audioNode, isError) {
        return __awaiter(this, void 0, void 0, function* () {
            this.privAudioNode = audioNode;
            this.privIsAudioNodeDetached = false;
            if (isError) {
                yield this.onComplete();
            }
            else {
                this.onEvent(new ListeningStartedEvent(this.privRequestId, this.privSessionId, this.privAudioSourceId, this.privAudioNodeId));
            }
        });
    }
    onPreConnectionStart(authFetchEventId, connectionId) {
        this.privAuthFetchEventId = authFetchEventId;
        this.privSessionId = connectionId;
        this.onEvent(new ConnectingToServiceEvent(this.privRequestId, this.privAuthFetchEventId, this.privSessionId));
    }
    onAuthCompleted(isError) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isError) {
                yield this.onComplete();
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onConnectionEstablishCompleted(statusCode, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            if (statusCode === 200) {
                this.onEvent(new RecognitionStartedEvent(this.requestId, this.privAudioSourceId, this.privAudioNodeId, this.privAuthFetchEventId, this.privSessionId));
                if (!!this.privAudioNode) {
                    this.privAudioNode.replay();
                }
                this.privTurnStartAudioOffset = this.privLastRecoOffset;
                this.privBytesSent = 0;
                return;
            }
            else if (statusCode === 403) {
                yield this.onComplete();
            }
        });
    }
    onServiceTurnEndResponse(continuousRecognition) {
        return __awaiter(this, void 0, void 0, function* () {
            this.privTurnDeferral.resolve();
            if (!continuousRecognition || this.isSpeechEnded) {
                yield this.onComplete();
                this.privInTurn = false;
            }
            else {
                // Start a new request set.
                this.privTurnStartAudioOffset = this.privLastRecoOffset;
                this.privAudioNode.replay();
            }
        });
    }
    onSpeechContext() {
        this.privRequestId = createNoDashGuid();
    }
    onServiceTurnStartResponse() {
        if (!!this.privTurnDeferral && !!this.privInTurn) {
            // What? How are we starting a turn with another not done?
            this.privTurnDeferral.reject("Another turn started before current completed.");
            // Avoid UnhandledPromiseRejection if privTurnDeferral is not being awaited
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            this.privTurnDeferral.promise.then().catch(() => { });
        }
        this.privInTurn = true;
        this.privTurnDeferral = new Deferred();
    }
    onHypothesis(offset) {
        if (!this.privHypothesisReceived) {
            this.privHypothesisReceived = true;
            this.privServiceTelemetryListener.hypothesisReceived(this.privAudioNode.findTimeAtOffset(offset));
        }
    }
    onPhraseRecognized(offset) {
        this.privServiceTelemetryListener.phraseReceived(this.privAudioNode.findTimeAtOffset(offset));
        this.onServiceRecognized(offset);
    }
    onServiceRecognized(offset) {
        this.privLastRecoOffset = offset;
        this.privHypothesisReceived = false;
        this.privAudioNode.shrinkBuffers(offset);
        this.privConnectionAttempts = 0;
    }
    onAudioSent(bytesSent) {
        this.privBytesSent += bytesSent;
        this.privRecognitionBytesSent += bytesSent;
    }
    onRetryConnection() {
        this.privConnectionAttempts++;
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.privIsDisposed) {
                // we should have completed by now. If we did not its an unknown error.
                this.privIsDisposed = true;
                for (const detachable of this.privDetachables) {
                    yield detachable.detach();
                }
                if (!!this.privServiceTelemetryListener) {
                    this.privServiceTelemetryListener.dispose();
                }
                this.privIsRecognizing = false;
            }
        });
    }
    getTelemetry() {
        if (this.privServiceTelemetryListener.hasTelemetry) {
            return this.privServiceTelemetryListener.getTelemetry();
        }
        else {
            return null;
        }
    }
    onStopRecognizing() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.onComplete();
        });
    }
    // Should be called with the audioNode for this session has indicated that it is out of speech.
    onSpeechEnded() {
        this.privIsSpeechEnded = true;
    }
    onEvent(event) {
        if (!!this.privServiceTelemetryListener) {
            this.privServiceTelemetryListener.onEvent(event);
        }
        Events.instance.onEvent(event);
    }
    onComplete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.privIsRecognizing) {
                this.privIsRecognizing = false;
                yield this.detachAudioNode();
            }
        });
    }
    detachAudioNode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.privIsAudioNodeDetached) {
                this.privIsAudioNodeDetached = true;
                if (this.privAudioNode) {
                    yield this.privAudioNode.detach();
                }
            }
        });
    }
}

//# sourceMappingURL=RequestSession.js.map
