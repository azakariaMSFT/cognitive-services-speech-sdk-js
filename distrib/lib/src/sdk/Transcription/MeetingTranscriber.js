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
import { TranscriberRecognizer } from "../../common.speech/Exports.js";
import { marshalPromiseToCallbacks } from "../../common/Exports.js";
import { Contracts } from "../Contracts.js";
import { Connection, PropertyCollection, PropertyId } from "../Exports.js";
import { MeetingImpl } from "./Exports.js";
export class MeetingTranscriber {
    /**
     * MeetingTranscriber constructor.
     * @constructor
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the recognizer
     */
    constructor(audioConfig) {
        this.privAudioConfig = audioConfig;
        this.privProperties = new PropertyCollection();
        this.privRecognizer = undefined;
        this.privDisposedRecognizer = false;
    }
    /**
     * Gets the spoken language of recognition.
     * @member MeetingTranscriber.prototype.speechRecognitionLanguage
     * @function
     * @public
     * @returns {string} The spoken language of recognition.
     */
    get speechRecognitionLanguage() {
        Contracts.throwIfDisposed(this.privDisposedRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage);
    }
    /**
     * The collection of properties and their values defined for this MeetingTranscriber.
     * @member MeetingTranscriber.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this MeetingTranscriber.
     */
    get properties() {
        return this.privProperties;
    }
    /**
     * @Internal
     * Internal data member to support fromRecognizer* pattern methods on other classes.
     * Do not use externally, object returned will change without warning or notice.
     */
    get internalData() {
        return this.privRecognizer.internalData;
    }
    /**
     * @Deprecated
     * @Obsolete
     * Please use the Connection.fromRecognizer pattern to obtain a connection object
     */
    get connection() {
        return Connection.fromRecognizer(this.privRecognizer);
    }
    /**
     * Gets the authorization token used to communicate with the service.
     * @member MeetingTranscriber.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member MeetingTranscriber.prototype.authorizationToken
     * @function
     * @public
     * @param {string} token - Authorization token.
     */
    set authorizationToken(token) {
        Contracts.throwIfNullOrWhitespace(token, "token");
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, token);
    }
    /**
     * @param {Meeting} meeting - meeting to be recognized
     */
    joinMeetingAsync(meeting, cb, err) {
        /* eslint-disable no-console */
        // console.log(">> MeetingTranscriber::joinMeetingAsync");
        /* eslint-enable no-console */
        const meetingImpl = meeting;
        Contracts.throwIfNullOrUndefined(MeetingImpl, "Meeting");
        // ref the meeting object
        // create recognizer and subscribe to recognizer events
        this.privRecognizer = new TranscriberRecognizer(meeting.config, this.privAudioConfig);
        Contracts.throwIfNullOrUndefined(this.privRecognizer, "Recognizer");
        this.privRecognizer.connectMeetingCallbacks(this);
        marshalPromiseToCallbacks(meetingImpl.connectTranscriberRecognizer(this.privRecognizer), cb, err);
    }
    /**
     * Starts meeting transcription, until stopTranscribingAsync() is called.
     * User must subscribe to events to receive transcription results.
     * @member MeetingTranscriber.prototype.startTranscribingAsync
     * @function
     * @public
     * @param cb - Callback invoked once the transcription has started.
     * @param err - Callback invoked in case of an error.
     */
    startTranscribingAsync(cb, err) {
        this.privRecognizer.startContinuousRecognitionAsync(cb, err);
    }
    /**
     * Starts meeting transcription, until stopTranscribingAsync() is called.
     * User must subscribe to events to receive transcription results.
     * @member MeetingTranscriber.prototype.stopTranscribingAsync
     * @function
     * @public
     * @param cb - Callback invoked once the transcription has started.
     * @param err - Callback invoked in case of an error.
     */
    stopTranscribingAsync(cb, err) {
        this.privRecognizer.stopContinuousRecognitionAsync(cb, err);
    }
    /**
     * Leave the current meeting. After this is called, you will no longer receive any events.
     */
    leaveMeetingAsync(cb, err) {
        this.privRecognizer.disconnectCallbacks();
        // eslint-disable-next-line
        marshalPromiseToCallbacks((() => __awaiter(this, void 0, void 0, function* () { return; }))(), cb, err);
    }
    /**
     * closes all external resources held by an instance of this class.
     * @member MeetingTranscriber.prototype.close
     * @function
     * @public
     */
    close(cb, errorCb) {
        Contracts.throwIfDisposed(this.privDisposedRecognizer);
        marshalPromiseToCallbacks(this.dispose(true), cb, errorCb);
    }
    /**
     * Disposes any resources held by the object.
     * @member MeetingTranscriber.prototype.dispose
     * @function
     * @public
     * @param {boolean} disposing - true if disposing the object.
     */
    dispose(disposing) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.privDisposedRecognizer) {
                return;
            }
            if (!!this.privRecognizer) {
                yield this.privRecognizer.close();
                this.privRecognizer = undefined;
            }
            if (disposing) {
                this.privDisposedRecognizer = true;
            }
        });
    }
}

//# sourceMappingURL=MeetingTranscriber.js.map
