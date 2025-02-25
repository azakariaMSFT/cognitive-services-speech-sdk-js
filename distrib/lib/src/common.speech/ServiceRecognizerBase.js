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
import { ReplayableAudioNode } from "../common.browser/Exports.js";
import { ArgumentNullError, ConnectionState, createNoDashGuid, EventSource, MessageType, ServiceEvent, Timeout } from "../common/Exports.js";
import { CancellationErrorCode, CancellationReason, PropertyId, RecognitionEventArgs, SessionEventArgs, OutputFormat } from "../sdk/Exports.js";
import { AgentConfig, DynamicGrammarBuilder, RecognitionMode, RequestSession, SpeechContext, SpeechDetected, type, OutputFormatPropertyName } from "./Exports.js";
import { SpeechConnectionMessage } from "./SpeechConnectionMessage.Internal.js";
export class ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, recognizer) {
        // A promise for a configured connection.
        // Do not consume directly, call fetchConnection instead.
        this.privConnectionConfigurationPromise = undefined;
        // A promise for a connection, but one that has not had the speech context sent yet.
        // Do not consume directly, call fetchConnection instead.
        this.privConnectionPromise = undefined;
        this.privSetTimeout = setTimeout;
        this.privIsLiveAudio = false;
        this.privAverageBytesPerMs = 0;
        this.privEnableSpeakerId = false;
        this.privExpectContentAssessmentResponse = false;
        this.recognizeOverride = undefined;
        this.recognizeSpeaker = undefined;
        this.disconnectOverride = undefined;
        this.receiveMessageOverride = undefined;
        this.sendPrePayloadJSONOverride = undefined;
        this.postConnectImplOverride = undefined;
        this.configConnectionOverride = undefined;
        this.handleSpeechPhraseMessage = undefined;
        this.handleSpeechHypothesisMessage = undefined;
        if (!authentication) {
            throw new ArgumentNullError("authentication");
        }
        if (!connectionFactory) {
            throw new ArgumentNullError("connectionFactory");
        }
        if (!audioSource) {
            throw new ArgumentNullError("audioSource");
        }
        if (!recognizerConfig) {
            throw new ArgumentNullError("recognizerConfig");
        }
        this.privEnableSpeakerId = recognizerConfig.isSpeakerDiarizationEnabled;
        this.privMustReportEndOfStream = false;
        this.privAuthentication = authentication;
        this.privConnectionFactory = connectionFactory;
        this.privAudioSource = audioSource;
        this.privRecognizerConfig = recognizerConfig;
        this.privIsDisposed = false;
        this.privRecognizer = recognizer;
        this.privRequestSession = new RequestSession(this.privAudioSource.id());
        this.privConnectionEvents = new EventSource();
        this.privServiceEvents = new EventSource();
        this.privDynamicGrammar = new DynamicGrammarBuilder();
        this.privSpeechContext = new SpeechContext(this.privDynamicGrammar);
        this.privAgentConfig = new AgentConfig();
        const webWorkerLoadType = this.privRecognizerConfig.parameters.getProperty(PropertyId.WebWorkerLoadType, "on").toLowerCase();
        if (webWorkerLoadType === "on" && typeof (Blob) !== "undefined" && typeof (Worker) !== "undefined") {
            this.privSetTimeout = Timeout.setTimeout;
        }
        else {
            if (typeof window !== "undefined") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                this.privSetTimeout = window.setTimeout.bind(window);
            }
        }
        this.connectionEvents.attach((connectionEvent) => {
            if (connectionEvent.name === "ConnectionClosedEvent") {
                const connectionClosedEvent = connectionEvent;
                if (connectionClosedEvent.statusCode === 1003 ||
                    connectionClosedEvent.statusCode === 1007 ||
                    connectionClosedEvent.statusCode === 1002 ||
                    connectionClosedEvent.statusCode === 4000 ||
                    this.privRequestSession.numConnectionAttempts > this.privRecognizerConfig.maxRetryCount) {
                    void this.cancelRecognitionLocal(CancellationReason.Error, connectionClosedEvent.statusCode === 1007 ? CancellationErrorCode.BadRequestParameters : CancellationErrorCode.ConnectionFailure, `${connectionClosedEvent.reason} websocket error code: ${connectionClosedEvent.statusCode}`);
                }
            }
        });
        if (this.privEnableSpeakerId) {
            this.privDiarizationSessionId = createNoDashGuid();
        }
        this.setLanguageIdJson();
        this.setOutputDetailLevelJson();
    }
    setTranslationJson() {
        const targetLanguages = this.privRecognizerConfig.parameters.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages, undefined);
        if (targetLanguages !== undefined) {
            const languages = targetLanguages.split(",");
            const translationVoice = this.privRecognizerConfig.parameters.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice, undefined);
            const action = (translationVoice !== undefined) ? "Synthesize" : "None";
            this.privSpeechContext.setSection("translation", {
                onSuccess: { action },
                output: { interimResults: { mode: "Always" } },
                targetLanguages: languages,
            });
            if (translationVoice !== undefined) {
                const languageToVoiceMap = {};
                for (const lang of languages) {
                    languageToVoiceMap[lang] = translationVoice;
                }
                this.privSpeechContext.setSection("synthesis", {
                    defaultVoices: languageToVoiceMap
                });
            }
        }
    }
    setSpeechSegmentationTimeoutJson() {
        const speechSegmentationTimeout = this.privRecognizerConfig.parameters.getProperty(PropertyId.Speech_SegmentationSilenceTimeoutMs, undefined);
        if (speechSegmentationTimeout !== undefined) {
            const mode = this.recognitionMode === RecognitionMode.Conversation ? "CONVERSATION" :
                this.recognitionMode === RecognitionMode.Dictation ? "DICTATION" : "INTERACTIVE";
            const segmentationSilenceTimeoutMs = parseInt(speechSegmentationTimeout, 10);
            const phraseDetection = this.privSpeechContext.getSection("phraseDetection");
            phraseDetection.mode = mode;
            phraseDetection[mode] = {
                segmentation: {
                    mode: "Custom",
                    segmentationSilenceTimeoutMs
                }
            };
            this.privSpeechContext.setSection("phraseDetection", phraseDetection);
        }
    }
    setLanguageIdJson() {
        const phraseDetection = this.privSpeechContext.getSection("phraseDetection");
        if (this.privRecognizerConfig.autoDetectSourceLanguages !== undefined) {
            const sourceLanguages = this.privRecognizerConfig.autoDetectSourceLanguages.split(",");
            let speechContextLidMode;
            if (this.privRecognizerConfig.languageIdMode === "Continuous") {
                speechContextLidMode = "DetectContinuous";
            }
            else { // recognizerConfig.languageIdMode === "AtStart"
                speechContextLidMode = "DetectAtAudioStart";
            }
            this.privSpeechContext.setSection("languageId", {
                Priority: "PrioritizeLatency",
                languages: sourceLanguages,
                mode: speechContextLidMode,
                onSuccess: { action: "Recognize" },
                onUnknown: { action: "None" }
            });
            this.privSpeechContext.setSection("phraseOutput", {
                interimResults: {
                    resultType: "Auto"
                },
                phraseResults: {
                    resultType: "Always"
                }
            });
            const customModels = this.privRecognizerConfig.sourceLanguageModels;
            if (customModels !== undefined) {
                phraseDetection.customModels = customModels;
                phraseDetection.onInterim = { action: "None" };
                phraseDetection.onSuccess = { action: "None" };
            }
        }
        const targetLanguages = this.privRecognizerConfig.parameters.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages, undefined);
        if (targetLanguages !== undefined) {
            phraseDetection.onInterim = { action: "Translate" };
            phraseDetection.onSuccess = { action: "Translate" };
            this.privSpeechContext.setSection("phraseOutput", {
                interimResults: {
                    resultType: "None"
                },
                phraseResults: {
                    resultType: "None"
                }
            });
        }
        this.privSpeechContext.setSection("phraseDetection", phraseDetection);
    }
    setOutputDetailLevelJson() {
        if (this.privEnableSpeakerId) {
            const requestWordLevelTimestamps = this.privRecognizerConfig.parameters.getProperty(PropertyId.SpeechServiceResponse_RequestWordLevelTimestamps, "false").toLowerCase();
            if (requestWordLevelTimestamps === "true") {
                this.privSpeechContext.setWordLevelTimings();
            }
            else {
                const outputFormat = this.privRecognizerConfig.parameters.getProperty(OutputFormatPropertyName, OutputFormat[OutputFormat.Simple]).toLowerCase();
                if (outputFormat === OutputFormat[OutputFormat.Detailed].toLocaleLowerCase()) {
                    this.privSpeechContext.setDetailedOutputFormat();
                }
            }
        }
    }
    get isSpeakerDiarizationEnabled() {
        return this.privEnableSpeakerId;
    }
    get audioSource() {
        return this.privAudioSource;
    }
    get speechContext() {
        return this.privSpeechContext;
    }
    get dynamicGrammar() {
        return this.privDynamicGrammar;
    }
    get agentConfig() {
        return this.privAgentConfig;
    }
    set conversationTranslatorToken(token) {
        this.privRecognizerConfig.parameters.setProperty(PropertyId.ConversationTranslator_Token, token);
    }
    set voiceProfileType(type) {
        this.privRecognizerConfig.parameters.setProperty(PropertyId.SpeechServiceConnection_SpeakerIdMode, type);
    }
    set authentication(auth) {
        this.privAuthentication = auth;
    }
    isDisposed() {
        return this.privIsDisposed;
    }
    dispose(reason) {
        return __awaiter(this, void 0, void 0, function* () {
            this.privIsDisposed = true;
            if (this.privConnectionConfigurationPromise !== undefined) {
                try {
                    const connection = yield this.privConnectionConfigurationPromise;
                    yield connection.dispose(reason);
                }
                catch (error) {
                    // The connection is in a bad state. But we're trying to kill it, so...
                    return;
                }
            }
        });
    }
    get connectionEvents() {
        return this.privConnectionEvents;
    }
    get serviceEvents() {
        return this.privServiceEvents;
    }
    get recognitionMode() {
        return this.privRecognizerConfig.recognitionMode;
    }
    recognize(recoMode, successCallback, errorCallBack) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.recognizeOverride !== undefined) {
                yield this.recognizeOverride(recoMode, successCallback, errorCallBack);
                return;
            }
            // Clear the existing configuration promise to force a re-transmission of config and context.
            this.privConnectionConfigurationPromise = undefined;
            this.privRecognizerConfig.recognitionMode = recoMode;
            this.setSpeechSegmentationTimeoutJson();
            this.setTranslationJson();
            this.privSuccessCallback = successCallback;
            this.privErrorCallback = errorCallBack;
            this.privRequestSession.startNewRecognition();
            this.privRequestSession.listenForServiceTelemetry(this.privAudioSource.events);
            // Start the connection to the service. The promise this will create is stored and will be used by configureConnection().
            const conPromise = this.connectImpl();
            let audioNode;
            try {
                const audioStreamNode = yield this.audioSource.attach(this.privRequestSession.audioNodeId);
                const format = yield this.audioSource.format;
                const deviceInfo = yield this.audioSource.deviceInfo;
                this.privIsLiveAudio = deviceInfo.type && deviceInfo.type === type.Microphones;
                audioNode = new ReplayableAudioNode(audioStreamNode, format.avgBytesPerSec);
                yield this.privRequestSession.onAudioSourceAttachCompleted(audioNode, false);
                this.privRecognizerConfig.SpeechServiceConfig.Context.audio = { source: deviceInfo };
            }
            catch (error) {
                yield this.privRequestSession.onStopRecognizing();
                throw error;
            }
            try {
                yield conPromise;
            }
            catch (error) {
                yield this.cancelRecognitionLocal(CancellationReason.Error, CancellationErrorCode.ConnectionFailure, error);
                return;
            }
            const sessionStartEventArgs = new SessionEventArgs(this.privRequestSession.sessionId);
            if (!!this.privRecognizer.sessionStarted) {
                this.privRecognizer.sessionStarted(this.privRecognizer, sessionStartEventArgs);
            }
            void this.receiveMessage();
            const audioSendPromise = this.sendAudio(audioNode);
            audioSendPromise.catch((error) => __awaiter(this, void 0, void 0, function* () {
                yield this.cancelRecognitionLocal(CancellationReason.Error, CancellationErrorCode.RuntimeError, error);
            }));
            return;
        });
    }
    stopRecognizing() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.privRequestSession.isRecognizing) {
                try {
                    yield this.audioSource.turnOff();
                    yield this.sendFinalAudio();
                    yield this.privRequestSession.onStopRecognizing();
                    yield this.privRequestSession.turnCompletionPromise;
                }
                finally {
                    yield this.privRequestSession.dispose();
                }
            }
            return;
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectImpl();
            return Promise.resolve();
        });
    }
    connectAsync(cb, err) {
        this.connectImpl().then(() => {
            try {
                if (!!cb) {
                    cb();
                }
            }
            catch (e) {
                if (!!err) {
                    err(e);
                }
            }
        }, (reason) => {
            try {
                if (!!err) {
                    err(reason);
                }
                /* eslint-disable no-empty */
            }
            catch (error) {
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cancelRecognitionLocal(CancellationReason.Error, CancellationErrorCode.NoError, "Disconnecting");
            if (this.disconnectOverride !== undefined) {
                yield this.disconnectOverride();
            }
            if (this.privConnectionPromise !== undefined) {
                try {
                    yield (yield this.privConnectionPromise).dispose();
                }
                catch (error) {
                }
            }
            this.privConnectionPromise = undefined;
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendMessage(message) {
        return;
    }
    sendNetworkMessage(path, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = typeof payload === "string" ? MessageType.Text : MessageType.Binary;
            const contentType = typeof payload === "string" ? "application/json" : "";
            const connection = yield this.fetchConnection();
            return connection.send(new SpeechConnectionMessage(type, path, this.privRequestSession.requestId, contentType, payload));
        });
    }
    set activityTemplate(messagePayload) {
        this.privActivityTemplate = messagePayload;
    }
    get activityTemplate() {
        return this.privActivityTemplate;
    }
    set expectContentAssessmentResponse(value) {
        this.privExpectContentAssessmentResponse = value;
    }
    sendTelemetryData() {
        return __awaiter(this, void 0, void 0, function* () {
            const telemetryData = this.privRequestSession.getTelemetry();
            if (ServiceRecognizerBase.telemetryDataEnabled !== true ||
                this.privIsDisposed ||
                null === telemetryData) {
                return;
            }
            if (!!ServiceRecognizerBase.telemetryData) {
                try {
                    ServiceRecognizerBase.telemetryData(telemetryData);
                    /* eslint-disable no-empty */
                }
                catch (_a) { }
            }
            const connection = yield this.fetchConnection();
            yield connection.send(new SpeechConnectionMessage(MessageType.Text, "telemetry", this.privRequestSession.requestId, "application/json", telemetryData));
        });
    }
    // Cancels recognition.
    cancelRecognitionLocal(cancellationReason, errorCode, error) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.privRequestSession.isRecognizing) {
                yield this.privRequestSession.onStopRecognizing();
                this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, cancellationReason, errorCode, error);
            }
        });
    }
    receiveMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.privIsDisposed) {
                    // We're done.
                    return;
                }
                let connection = yield this.fetchConnection();
                const message = yield connection.read();
                if (this.receiveMessageOverride !== undefined) {
                    return this.receiveMessageOverride();
                }
                // indicates we are draining the queue and it came with no message;
                if (!message) {
                    return this.receiveMessage();
                }
                this.privServiceHasSentMessage = true;
                const connectionMessage = SpeechConnectionMessage.fromConnectionMessage(message);
                if (connectionMessage.requestId.toLowerCase() === this.privRequestSession.requestId.toLowerCase()) {
                    switch (connectionMessage.path.toLowerCase()) {
                        case "turn.start":
                            this.privMustReportEndOfStream = true;
                            this.privRequestSession.onServiceTurnStartResponse();
                            break;
                        case "speech.startdetected":
                            const speechStartDetected = SpeechDetected.fromJSON(connectionMessage.textBody);
                            const speechStartEventArgs = new RecognitionEventArgs(speechStartDetected.Offset, this.privRequestSession.sessionId);
                            if (!!this.privRecognizer.speechStartDetected) {
                                this.privRecognizer.speechStartDetected(this.privRecognizer, speechStartEventArgs);
                            }
                            break;
                        case "speech.enddetected":
                            let json;
                            if (connectionMessage.textBody.length > 0) {
                                json = connectionMessage.textBody;
                            }
                            else {
                                // If the request was empty, the JSON returned is empty.
                                json = "{ Offset: 0 }";
                            }
                            const speechStopDetected = SpeechDetected.fromJSON(json);
                            const speechStopEventArgs = new RecognitionEventArgs(speechStopDetected.Offset + this.privRequestSession.currentTurnAudioOffset, this.privRequestSession.sessionId);
                            if (!!this.privRecognizer.speechEndDetected) {
                                this.privRecognizer.speechEndDetected(this.privRecognizer, speechStopEventArgs);
                            }
                            break;
                        case "turn.end":
                            yield this.sendTelemetryData();
                            if (this.privRequestSession.isSpeechEnded && this.privMustReportEndOfStream) {
                                this.privMustReportEndOfStream = false;
                                yield this.cancelRecognitionLocal(CancellationReason.EndOfStream, CancellationErrorCode.NoError, undefined);
                            }
                            const sessionStopEventArgs = new SessionEventArgs(this.privRequestSession.sessionId);
                            yield this.privRequestSession.onServiceTurnEndResponse(this.privRecognizerConfig.isContinuousRecognition);
                            if (!this.privRecognizerConfig.isContinuousRecognition || this.privRequestSession.isSpeechEnded || !this.privRequestSession.isRecognizing) {
                                if (!!this.privRecognizer.sessionStopped) {
                                    this.privRecognizer.sessionStopped(this.privRecognizer, sessionStopEventArgs);
                                }
                                return;
                            }
                            else {
                                connection = yield this.fetchConnection();
                                yield this.sendPrePayloadJSON(connection);
                            }
                            break;
                        default:
                            if (!(yield this.processTypeSpecificMessages(connectionMessage))) {
                                // here are some messages that the derived class has not processed, dispatch them to connect class
                                if (!!this.privServiceEvents) {
                                    this.serviceEvents.onEvent(new ServiceEvent(connectionMessage.path.toLowerCase(), connectionMessage.textBody));
                                }
                            }
                    }
                }
                return this.receiveMessage();
            }
            catch (error) {
                return null;
            }
        });
    }
    updateSpeakerDiarizationAudioOffset() {
        const bytesSent = this.privRequestSession.recognitionBytesSent;
        const audioOffsetMs = bytesSent / this.privAverageBytesPerMs;
        this.privSpeechContext.setSpeakerDiarizationAudioOffsetMs(audioOffsetMs);
    }
    sendSpeechContext(connection, generateNewRequestId) {
        if (this.privEnableSpeakerId) {
            this.updateSpeakerDiarizationAudioOffset();
        }
        const speechContextJson = this.speechContext.toJSON();
        if (generateNewRequestId) {
            this.privRequestSession.onSpeechContext();
        }
        if (speechContextJson) {
            return connection.send(new SpeechConnectionMessage(MessageType.Text, "speech.context", this.privRequestSession.requestId, "application/json", speechContextJson));
        }
        return;
    }
    noOp() {
        // operation not supported
        return;
    }
    // Encapsulated for derived service recognizers that need to send additional JSON
    sendPrePayloadJSON(connection, generateNewRequestId = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sendPrePayloadJSONOverride !== undefined) {
                return this.sendPrePayloadJSONOverride(connection);
            }
            yield this.sendSpeechContext(connection, generateNewRequestId);
            yield this.sendWaveHeader(connection);
            return;
        });
    }
    sendWaveHeader(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const format = yield this.audioSource.format;
            // this.writeBufferToConsole(format.header);
            return connection.send(new SpeechConnectionMessage(MessageType.Binary, "audio", this.privRequestSession.requestId, "audio/x-wav", format.header));
        });
    }
    // Establishes a websocket connection to the end point.
    connectImpl() {
        if (this.privConnectionPromise !== undefined) {
            return this.privConnectionPromise.then((connection) => {
                if (connection.state() === ConnectionState.Disconnected) {
                    this.privConnectionId = null;
                    this.privConnectionPromise = undefined;
                    this.privServiceHasSentMessage = false;
                    return this.connectImpl();
                }
                return this.privConnectionPromise;
            }, () => {
                this.privConnectionId = null;
                this.privConnectionPromise = undefined;
                this.privServiceHasSentMessage = false;
                return this.connectImpl();
            });
        }
        this.privConnectionPromise = this.retryableConnect();
        // Attach an empty handler to allow the promise to run in the background while
        // other startup events happen. It'll eventually be awaited on.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.privConnectionPromise.catch(() => { });
        if (this.postConnectImplOverride !== undefined) {
            return this.postConnectImplOverride(this.privConnectionPromise);
        }
        return this.privConnectionPromise;
    }
    sendSpeechServiceConfig(connection, requestSession, SpeechServiceConfigJson) {
        requestSession.onSpeechContext();
        // filter out anything that is not required for the service to work.
        if (ServiceRecognizerBase.telemetryDataEnabled !== true) {
            const withTelemetry = JSON.parse(SpeechServiceConfigJson);
            const replacement = {
                context: {
                    system: withTelemetry.context.system,
                },
            };
            SpeechServiceConfigJson = JSON.stringify(replacement);
        }
        if (this.privRecognizerConfig.parameters.getProperty("f0f5debc-f8c9-4892-ac4b-90a7ab359fd2", "false").toLowerCase() === "true") {
            const json = JSON.parse(SpeechServiceConfigJson);
            json.context.DisableReferenceChannel = "True";
            json.context.MicSpec = "1_0_0";
            SpeechServiceConfigJson = JSON.stringify(json);
        }
        if (SpeechServiceConfigJson) {
            return connection.send(new SpeechConnectionMessage(MessageType.Text, "speech.config", requestSession.requestId, "application/json", SpeechServiceConfigJson));
        }
        return;
    }
    fetchConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.privConnectionConfigurationPromise !== undefined) {
                return this.privConnectionConfigurationPromise.then((connection) => {
                    if (connection.state() === ConnectionState.Disconnected) {
                        this.privConnectionId = null;
                        this.privConnectionConfigurationPromise = undefined;
                        this.privServiceHasSentMessage = false;
                        return this.fetchConnection();
                    }
                    return this.privConnectionConfigurationPromise;
                }, () => {
                    this.privConnectionId = null;
                    this.privConnectionConfigurationPromise = undefined;
                    this.privServiceHasSentMessage = false;
                    return this.fetchConnection();
                });
            }
            this.privConnectionConfigurationPromise = this.configureConnection();
            return yield this.privConnectionConfigurationPromise;
        });
    }
    sendAudio(audioStreamNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const audioFormat = yield this.audioSource.format;
            this.privAverageBytesPerMs = audioFormat.avgBytesPerSec / 1000;
            // The time we last sent data to the service.
            let nextSendTime = Date.now();
            // Max amount to send before we start to throttle
            const fastLaneSizeMs = this.privRecognizerConfig.parameters.getProperty("SPEECH-TransmitLengthBeforThrottleMs", "5000");
            const maxSendUnthrottledBytes = audioFormat.avgBytesPerSec / 1000 * parseInt(fastLaneSizeMs, 10);
            const startRecogNumber = this.privRequestSession.recogNumber;
            const readAndUploadCycle = () => __awaiter(this, void 0, void 0, function* () {
                // If speech is done, stop sending audio.
                if (!this.privIsDisposed &&
                    !this.privRequestSession.isSpeechEnded &&
                    this.privRequestSession.isRecognizing &&
                    this.privRequestSession.recogNumber === startRecogNumber) {
                    const connection = yield this.fetchConnection();
                    const audioStreamChunk = yield audioStreamNode.read();
                    // we have a new audio chunk to upload.
                    if (this.privRequestSession.isSpeechEnded) {
                        // If service already recognized audio end then don't send any more audio
                        return;
                    }
                    let payload;
                    let sendDelay;
                    if (!audioStreamChunk || audioStreamChunk.isEnd) {
                        payload = null;
                        sendDelay = 0;
                    }
                    else {
                        payload = audioStreamChunk.buffer;
                        this.privRequestSession.onAudioSent(payload.byteLength);
                        if (maxSendUnthrottledBytes >= this.privRequestSession.bytesSent) {
                            sendDelay = 0;
                        }
                        else {
                            sendDelay = Math.max(0, nextSendTime - Date.now());
                        }
                    }
                    if (0 !== sendDelay) {
                        yield this.delay(sendDelay);
                    }
                    if (payload !== null) {
                        nextSendTime = Date.now() + (payload.byteLength * 1000 / (audioFormat.avgBytesPerSec * 2));
                    }
                    // Are we still alive?
                    if (!this.privIsDisposed &&
                        !this.privRequestSession.isSpeechEnded &&
                        this.privRequestSession.isRecognizing &&
                        this.privRequestSession.recogNumber === startRecogNumber) {
                        connection.send(new SpeechConnectionMessage(MessageType.Binary, "audio", this.privRequestSession.requestId, null, payload)).catch(() => {
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            this.privRequestSession.onServiceTurnEndResponse(this.privRecognizerConfig.isContinuousRecognition).catch(() => { });
                        });
                        if (!(audioStreamChunk === null || audioStreamChunk === void 0 ? void 0 : audioStreamChunk.isEnd)) {
                            // this.writeBufferToConsole(payload);
                            // Regardless of success or failure, schedule the next upload.
                            // If the underlying connection was broken, the next cycle will
                            // get a new connection and re-transmit missing audio automatically.
                            return readAndUploadCycle();
                        }
                        else {
                            // the audio stream has been closed, no need to schedule next
                            // read-upload cycle.
                            if (!this.privIsLiveAudio) {
                                this.privRequestSession.onSpeechEnded();
                            }
                        }
                    }
                }
            });
            return readAndUploadCycle();
        });
    }
    retryableConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            let isUnAuthorized = false;
            this.privAuthFetchEventId = createNoDashGuid();
            const sessionId = this.privRequestSession.sessionId;
            this.privConnectionId = (sessionId !== undefined) ? sessionId : createNoDashGuid();
            this.privRequestSession.onPreConnectionStart(this.privAuthFetchEventId, this.privConnectionId);
            let lastStatusCode = 0;
            let lastReason = "";
            while (this.privRequestSession.numConnectionAttempts <= this.privRecognizerConfig.maxRetryCount) {
                // Get the auth information for the connection. This is a bit of overkill for the current API surface, but leaving the plumbing in place to be able to raise a developer-customer
                // facing event when a connection fails to let them try and provide new auth information.
                const authPromise = isUnAuthorized ? this.privAuthentication.fetchOnExpiry(this.privAuthFetchEventId) : this.privAuthentication.fetch(this.privAuthFetchEventId);
                const auth = yield authPromise;
                yield this.privRequestSession.onAuthCompleted(false);
                // Create the connection
                const connection = this.privConnectionFactory.create(this.privRecognizerConfig, auth, this.privConnectionId);
                // Attach the telemetry handlers.
                this.privRequestSession.listenForServiceTelemetry(connection.events);
                // Attach to the underlying event. No need to hold onto the detach pointers as in the event the connection goes away,
                // it'll stop sending events.
                connection.events.attach((event) => {
                    this.connectionEvents.onEvent(event);
                });
                const response = yield connection.open();
                // 200 == everything is fine.
                if (response.statusCode === 200) {
                    yield this.privRequestSession.onConnectionEstablishCompleted(response.statusCode);
                    return Promise.resolve(connection);
                }
                else if (response.statusCode === 1006) {
                    isUnAuthorized = true;
                }
                lastStatusCode = response.statusCode;
                lastReason = response.reason;
                this.privRequestSession.onRetryConnection();
            }
            yield this.privRequestSession.onConnectionEstablishCompleted(lastStatusCode, lastReason);
            return Promise.reject(`Unable to contact server. StatusCode: ${lastStatusCode}, ${this.privRecognizerConfig.parameters.getProperty(PropertyId.SpeechServiceConnection_Endpoint)} Reason: ${lastReason}`);
        });
    }
    delay(delayMs) {
        return new Promise((resolve) => this.privSetTimeout(resolve, delayMs));
    }
    writeBufferToConsole(buffer) {
        let out = "Buffer Size: ";
        if (null === buffer) {
            out += "null";
        }
        else {
            const readView = new Uint8Array(buffer);
            out += `${buffer.byteLength}\r\n`;
            for (let i = 0; i < buffer.byteLength; i++) {
                out += readView[i].toString(16).padStart(2, "0") + " ";
                if (((i + 1) % 16) === 0) {
                    // eslint-disable-next-line no-console
                    console.info(out);
                    out = "";
                }
            }
        }
        // eslint-disable-next-line no-console
        console.info(out);
    }
    sendFinalAudio() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.fetchConnection();
            yield connection.send(new SpeechConnectionMessage(MessageType.Binary, "audio", this.privRequestSession.requestId, null, null));
            return;
        });
    }
    // Takes an established websocket connection to the endpoint and sends speech configuration information.
    configureConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.connectImpl();
            if (this.configConnectionOverride !== undefined) {
                return this.configConnectionOverride(connection);
            }
            yield this.sendSpeechServiceConfig(connection, this.privRequestSession, this.privRecognizerConfig.SpeechServiceConfig.serialize());
            yield this.sendPrePayloadJSON(connection, false);
            return connection;
        });
    }
}
ServiceRecognizerBase.telemetryDataEnabled = true;

//# sourceMappingURL=ServiceRecognizerBase.js.map
