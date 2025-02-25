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
import { DeferralMap, Deferred, MessageType, } from "../common/Exports.js";
import { CancellationErrorCode, CancellationReason, PropertyCollection, PropertyId, ResultReason, SessionEventArgs, VoiceProfileEnrollmentResult, VoiceProfilePhraseResult, VoiceProfileResult, VoiceProfileType } from "../sdk/Exports.js";
import { CancellationErrorCodePropertyName, ServiceRecognizerBase, } from "./Exports.js";
import { SpeechConnectionMessage } from "./SpeechConnectionMessage.Internal.js";
// eslint-disable-next-line max-classes-per-file
export class VoiceServiceRecognizer extends ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, recognizer) {
        super(authentication, connectionFactory, audioSource, recognizerConfig, recognizer);
        this.privDeferralMap = new DeferralMap();
        this.privSpeakerAudioSource = audioSource;
        this.sendPrePayloadJSONOverride = () => this.noOp();
    }
    set SpeakerAudioSource(audioSource) {
        this.privSpeakerAudioSource = audioSource;
    }
    processTypeSpecificMessages(connectionMessage) {
        let processed = false;
        const resultProps = new PropertyCollection();
        if (connectionMessage.messageType === MessageType.Text) {
            resultProps.setProperty(PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
        }
        switch (connectionMessage.path.toLowerCase()) {
            // Profile management response for create, fetch, delete, reset
            case "speaker.profiles":
                const response = JSON.parse(connectionMessage.textBody);
                switch (response.operation.toLowerCase()) {
                    case "create":
                        this.handleCreateResponse(response, connectionMessage.requestId);
                        break;
                    case "delete":
                    case "reset":
                        this.handleResultResponse(response, connectionMessage.requestId);
                        break;
                    case "fetch":
                        const enrollmentResponse = JSON.parse(connectionMessage.textBody);
                        this.handleFetchResponse(enrollmentResponse, connectionMessage.requestId);
                        break;
                    default:
                        break;
                }
                processed = true;
                break;
            // Activation and authorization phrase response
            case "speaker.phrases":
                const phraseResponse = JSON.parse(connectionMessage.textBody);
                this.handlePhrasesResponse(phraseResponse, connectionMessage.requestId);
                processed = true;
                break;
            // Enrollment response
            case "speaker.profile.enrollment":
                const enrollmentResponse = JSON.parse(connectionMessage.textBody);
                const result = new VoiceProfileEnrollmentResult(this.enrollmentReasonFrom(!!enrollmentResponse.enrollment ? enrollmentResponse.enrollment.enrollmentStatus : enrollmentResponse.status.statusCode), !!enrollmentResponse.enrollment ? JSON.stringify(enrollmentResponse.enrollment) : undefined, enrollmentResponse.status.reason);
                if (!!this.privDeferralMap.getId(connectionMessage.requestId)) {
                    this.privDeferralMap.complete(connectionMessage.requestId, result);
                }
                this.privRequestSession.onSpeechEnded();
                processed = true;
                break;
            default:
                break;
        }
        const defferal = new Deferred();
        defferal.resolve(processed);
        return defferal.promise;
    }
    // Cancels recognition.
    cancelRecognition(sessionId, requestId, cancellationReason, errorCode, error) {
        const properties = new PropertyCollection();
        // const enrollmentResponse: EnrollmentResponse = JSON.parse(connectionMessage.textBody) as EnrollmentResponse;
        properties.setProperty(CancellationErrorCodePropertyName, CancellationErrorCode[errorCode]);
        const result = new VoiceProfileEnrollmentResult(ResultReason.Canceled, error, error);
        if (!!this.privDeferralMap.getId(requestId)) {
            this.privDeferralMap.complete(requestId, result);
        }
    }
    createProfile(profileType, locale) {
        return __awaiter(this, void 0, void 0, function* () {
            // Start the connection to the service. The promise this will create is stored and will be used by configureConnection().
            this.voiceProfileType = profileType.toString();
            const conPromise = this.connectImpl();
            try {
                const createProfileDeferral = new Deferred();
                yield conPromise;
                yield this.sendCreateProfile(createProfileDeferral, profileType, locale);
                void this.receiveMessage();
                return createProfileDeferral.promise;
            }
            catch (err) {
                throw err;
            }
        });
    }
    resetProfile(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceProfileType = profile.profileType.toString();
            return this.sendCommonRequest("reset", profile.profileType, profile);
        });
    }
    deleteProfile(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceProfileType = profile.profileType.toString();
            return this.sendCommonRequest("delete", profile.profileType, profile);
        });
    }
    retrieveEnrollmentResult(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceProfileType = profile.profileType.toString();
            this.privExpectedProfileId = profile.profileId;
            return this.sendCommonRequest("fetch", profile.profileType, profile);
        });
    }
    getAllProfiles(profileType) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceProfileType = profileType.toString();
            return this.sendCommonRequest("fetch", profileType);
        });
    }
    getActivationPhrases(profileType, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceProfileType = profileType.toString();
            // Start the connection to the service. The promise this will create is stored and will be used by configureConnection().
            const conPromise = this.connectImpl();
            try {
                const getPhrasesDeferral = new Deferred();
                yield conPromise;
                yield this.sendPhrasesRequest(getPhrasesDeferral, profileType, lang);
                void this.receiveMessage();
                return getPhrasesDeferral.promise;
            }
            catch (err) {
                throw err;
            }
        });
    }
    enrollProfile(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceProfileType = profile.profileType.toString();
            const enrollmentDeferral = new Deferred();
            this.privRequestSession.startNewRecognition();
            this.privRequestSession.listenForServiceTelemetry(this.privSpeakerAudioSource.events);
            this.privRecognizerConfig.parameters.setProperty(PropertyId.Speech_SessionId, this.privRequestSession.sessionId);
            // Start the connection to the service. The promise this will create is stored and will be used by configureConnection().
            const conPromise = this.connectImpl();
            const preAudioPromise = this.sendPreAudioMessages(profile, enrollmentDeferral);
            const node = yield this.privSpeakerAudioSource.attach(this.privRequestSession.audioNodeId);
            const format = yield this.privSpeakerAudioSource.format;
            const deviceInfo = yield this.privSpeakerAudioSource.deviceInfo;
            const audioNode = new ReplayableAudioNode(node, format.avgBytesPerSec);
            yield this.privRequestSession.onAudioSourceAttachCompleted(audioNode, false);
            this.privRecognizerConfig.SpeechServiceConfig.Context.audio = { source: deviceInfo };
            try {
                yield conPromise;
                yield preAudioPromise;
            }
            catch (err) {
                this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, CancellationReason.Error, CancellationErrorCode.ConnectionFailure, err);
            }
            const sessionStartEventArgs = new SessionEventArgs(this.privRequestSession.sessionId);
            if (!!this.privRecognizer.sessionStarted) {
                this.privRecognizer.sessionStarted(this.privRecognizer, sessionStartEventArgs);
            }
            void this.receiveMessage();
            const audioSendPromise = this.sendAudio(audioNode);
            // /* eslint-disable no-empty */
            audioSendPromise.then(() => { }, (error) => {
                this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, CancellationReason.Error, CancellationErrorCode.RuntimeError, error);
            });
            return enrollmentDeferral.promise;
        });
    }
    sendPreAudioMessages(profile, enrollmentDeferral) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.fetchConnection();
            this.privRequestSession.onSpeechContext();
            this.privDeferralMap.add(this.privRequestSession.requestId, enrollmentDeferral);
            yield this.sendBaseRequest(connection, "enroll", this.scenarioFrom(profile.profileType), profile);
        });
    }
    sendPhrasesRequest(getPhrasesDeferral, profileType, locale) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.fetchConnection();
            this.privRequestSession.onSpeechContext();
            this.privDeferralMap.add(this.privRequestSession.requestId, getPhrasesDeferral);
            const scenario = this.scenarioFrom(profileType);
            const profileCreateRequest = {
                locale,
                scenario,
            };
            return connection.send(new SpeechConnectionMessage(MessageType.Text, "speaker.profile.phrases", this.privRequestSession.requestId, "application/json; charset=utf-8", JSON.stringify(profileCreateRequest)));
        });
    }
    sendCreateProfile(createProfileDeferral, profileType, locale) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.fetchConnection();
            this.privRequestSession.onSpeechContext();
            this.privDeferralMap.add(this.privRequestSession.requestId, createProfileDeferral);
            const scenario = profileType === VoiceProfileType.TextIndependentIdentification ? "TextIndependentIdentification" :
                profileType === VoiceProfileType.TextIndependentVerification ? "TextIndependentVerification" : "TextDependentVerification";
            const profileCreateRequest = {
                locale,
                number: "1",
                scenario,
            };
            return connection.send(new SpeechConnectionMessage(MessageType.Text, "speaker.profile.create", this.privRequestSession.requestId, "application/json; charset=utf-8", JSON.stringify(profileCreateRequest)));
        });
    }
    sendCommonRequest(operation, profileType, profile = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            // Start the connection to the service. The promise this will create is stored and will be used by configureConnection().
            const conPromise = this.connectImpl();
            try {
                const deferral = new Deferred();
                this.privRequestSession.onSpeechContext();
                yield conPromise;
                const connection = yield this.fetchConnection();
                this.privDeferralMap.add(this.privRequestSession.requestId, deferral);
                yield this.sendBaseRequest(connection, operation, this.scenarioFrom(profileType), profile);
                void this.receiveMessage();
                return deferral.promise;
            }
            catch (err) {
                throw err;
            }
        });
    }
    sendBaseRequest(connection, operation, scenario, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            const profileRequest = {
                scenario
            };
            if (!!profile) {
                profileRequest.profileIds = [profile.profileId];
            }
            else {
                profileRequest.maxPageSize = -1;
            }
            return connection.send(new SpeechConnectionMessage(MessageType.Text, `speaker.profile.${operation}`, this.privRequestSession.requestId, "application/json; charset=utf-8", JSON.stringify(profileRequest)));
        });
    }
    extractSpeakerContext(model) {
        return {
            features: {
                interimResult: "enabled",
                progressiveDetection: "disabled",
            },
            profileIds: model.profileIds,
            scenario: model.scenario,
        };
    }
    handlePhrasesResponse(response, requestId) {
        if (!!this.privDeferralMap.getId(requestId)) {
            if (response.status.statusCode.toLowerCase() !== "success") {
                const reason = ResultReason.Canceled;
                const result = new VoiceProfilePhraseResult(reason, response.status.statusCode, response.passPhraseType, []);
                this.privDeferralMap.complete(requestId, result);
            }
            else if (!!response.phrases && response.phrases.length > 0) {
                const reason = ResultReason.EnrollingVoiceProfile;
                const result = new VoiceProfilePhraseResult(reason, response.status.statusCode, response.passPhraseType, response.phrases);
                this.privDeferralMap.complete(requestId, result);
            }
            else {
                throw new Error("Voice Profile get activation phrases failed, no phrases received");
            }
        }
        else {
            throw new Error(`Voice Profile get activation phrases request for requestID ${requestId} not found`);
        }
    }
    handleCreateResponse(response, requestId) {
        if (!!response.profiles && response.profiles.length > 0) {
            if (!!this.privDeferralMap.getId(requestId)) {
                const profileIds = response.profiles.map((profile) => profile.profileId);
                this.privDeferralMap.complete(requestId, profileIds);
            }
            else {
                throw new Error(`Voice Profile create request for requestID ${requestId} not found`);
            }
        }
        else {
            throw new Error("Voice Profile create failed, no profile id received");
        }
    }
    handleResultResponse(response, requestId) {
        if (!!this.privDeferralMap.getId(requestId)) {
            const successReason = response.operation.toLowerCase() === "delete" ? ResultReason.DeletedVoiceProfile : ResultReason.ResetVoiceProfile;
            const reason = response.status.statusCode.toLowerCase() === "success" ? successReason : ResultReason.Canceled;
            const result = new VoiceProfileResult(reason, `statusCode: ${response.status.statusCode}, errorDetails: ${response.status.reason}`);
            this.privDeferralMap.complete(requestId, result);
        }
        else {
            throw new Error(`Voice Profile create request for requestID ${requestId} not found`);
        }
    }
    handleFetchResponse(enrollmentResponse, requestId) {
        if (!!this.privDeferralMap.getId(requestId) && !!enrollmentResponse.profiles[0]) {
            if (!!this.privExpectedProfileId && enrollmentResponse.profiles.length === 1 && enrollmentResponse.profiles[0].profileId === this.privExpectedProfileId) {
                this.privExpectedProfileId = undefined;
                const profileInfo = enrollmentResponse.profiles[0];
                const result = new VoiceProfileEnrollmentResult(this.enrollmentReasonFrom(profileInfo.enrollmentStatus), JSON.stringify(profileInfo), enrollmentResponse.status.reason);
                this.privDeferralMap.complete(requestId, result);
            }
            else if (enrollmentResponse.profiles.length > 0) {
                const iProfiles = enrollmentResponse.profiles;
                const profileResults = [];
                for (const profile of iProfiles) {
                    profileResults.push(new VoiceProfileEnrollmentResult(this.enrollmentReasonFrom(profile.enrollmentStatus), JSON.stringify(profile), enrollmentResponse.status.reason));
                }
                this.privDeferralMap.complete(requestId, profileResults);
            }
        }
        else {
            throw new Error(`Voice Profile fetch request for requestID ${requestId} not found`);
        }
    }
    enrollmentReasonFrom(statusCode) {
        switch (statusCode.toLowerCase()) {
            case "enrolled":
                return ResultReason.EnrolledVoiceProfile;
            case "invalidlocale":
            case "invalidphrase":
            case "invalidaudioformat":
            case "invalidscenario":
            case "invalidprofilecount":
            case "invalidoperation":
            case "audiotooshort":
            case "audiotoolong":
            case "toomanyenrollments":
            case "storageconflict":
            case "profilenotfound":
            case "incompatibleprofiles":
            case "incompleteenrollment":
                return ResultReason.Canceled;
            default:
                return ResultReason.EnrollingVoiceProfile;
        }
    }
    scenarioFrom(profileType) {
        return profileType === VoiceProfileType.TextIndependentIdentification ? "TextIndependentIdentification" :
            profileType === VoiceProfileType.TextIndependentVerification ? "TextIndependentVerification" : "TextDependentVerification";
    }
}

//# sourceMappingURL=VoiceServiceRecognizer.js.map
