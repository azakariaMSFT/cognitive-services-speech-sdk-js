// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// Multi-device Conversation is a Preview feature.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable max-classes-per-file */
import { ConversationConnectionConfig, ConversationManager, ConversationTranslatorCommandTypes, ConversationTranslatorMessageTypes, InternalParticipants } from "../../common.speech/Exports.js";
import { marshalPromiseToCallbacks } from "../../common/Exports.js";
import { Contracts } from "../Contracts.js";
import { ConversationParticipantsChangedEventArgs, ConversationTranslationEventArgs, Participant, ParticipantChangedReason, PropertyCollection, PropertyId, } from "../Exports.js";
export class Meeting {
    constructor() {
        return;
    }
    /**
     * Create a meeting
     * @param speechConfig
     * @param meetingId
     * @param cb
     * @param err
     */
    static createMeetingAsync(speechConfig, meetingId, arg3, arg4) {
        Contracts.throwIfNullOrUndefined(speechConfig, ConversationConnectionConfig.restErrors.invalidArgs.replace("{arg}", "config"));
        Contracts.throwIfNullOrUndefined(speechConfig.region, ConversationConnectionConfig.restErrors.invalidArgs.replace("{arg}", "SpeechServiceConnection_Region"));
        Contracts.throwIfNull(meetingId, "meetingId");
        if (meetingId.length === 0) {
            throw new Error("meetingId cannot be empty");
        }
        if (!speechConfig.subscriptionKey && !speechConfig.getProperty(PropertyId[PropertyId.SpeechServiceAuthorization_Token])) {
            Contracts.throwIfNullOrUndefined(speechConfig.subscriptionKey, ConversationConnectionConfig.restErrors.invalidArgs.replace("{arg}", "SpeechServiceConnection_Key"));
        }
        const meetingImpl = new MeetingImpl(speechConfig, meetingId);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        marshalPromiseToCallbacks((() => __awaiter(this, void 0, void 0, function* () { }))(), arg3, arg4);
        return meetingImpl;
    }
}
export class MeetingImpl extends Meeting {
    /**
     * Create a Meeting impl
     * @param speechConfig
     * @param {string} id - optional conversationId
     */
    constructor(speechConfig, id) {
        super();
        this.privErrors = ConversationConnectionConfig.restErrors;
        /** websocket callbacks */
        /* eslint-disable @typescript-eslint/typedef */
        this.onConnected = (e) => {
            var _a;
            this.privIsConnected = true;
            try {
                if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.sessionStarted)) {
                    this.privConversationTranslator.sessionStarted(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
        };
        this.onDisconnected = (e) => {
            var _a;
            try {
                if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.sessionStopped)) {
                    this.privConversationTranslator.sessionStopped(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
            finally {
                void this.close(false);
            }
        };
        this.onCanceled = (r, e) => {
            var _a;
            try {
                if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.canceled)) {
                    this.privConversationTranslator.canceled(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantUpdateCommandReceived = (r, e) => {
            try {
                const updatedParticipant = this.privParticipants.getParticipant(e.id);
                if (updatedParticipant !== undefined) {
                    switch (e.key) {
                        case ConversationTranslatorCommandTypes.changeNickname:
                            updatedParticipant.displayName = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setUseTTS:
                            updatedParticipant.isUsingTts = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setProfanityFiltering:
                            updatedParticipant.profanity = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setMute:
                            updatedParticipant.isMuted = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setTranslateToLanguages:
                            updatedParticipant.translateToLanguages = e.value;
                            break;
                    }
                    this.privParticipants.addOrUpdateParticipant(updatedParticipant);
                    if (!!this.privConversationTranslator) {
                        this.privConversationTranslator.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.Updated, [this.toParticipant(updatedParticipant)], e.sessionId));
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onLockRoomCommandReceived = () => {
            // TODO
        };
        this.onMuteAllCommandReceived = (r, e) => {
            try {
                this.privParticipants.participants.forEach((p) => p.isMuted = (p.isHost ? false : e.isMuted));
                if (!!this.privConversationTranslator) {
                    this.privConversationTranslator.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.Updated, this.toParticipants(false), e.sessionId));
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantJoinCommandReceived = (r, e) => {
            try {
                const newParticipant = this.privParticipants.addOrUpdateParticipant(e.participant);
                if (newParticipant !== undefined) {
                    if (!!this.privConversationTranslator) {
                        this.privConversationTranslator.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.JoinedConversation, [this.toParticipant(newParticipant)], e.sessionId));
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantLeaveCommandReceived = (r, e) => {
            try {
                const ejectedParticipant = this.privParticipants.getParticipant(e.participant.id);
                if (ejectedParticipant !== undefined) {
                    // remove the participant from the internal participants list
                    this.privParticipants.deleteParticipant(e.participant.id);
                    if (!!this.privConversationTranslator) {
                        // notify subscribers that the participant has left the conversation
                        this.privConversationTranslator.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.LeftConversation, [this.toParticipant(ejectedParticipant)], e.sessionId));
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onTranslationReceived = (r, e) => {
            try {
                switch (e.command) {
                    case ConversationTranslatorMessageTypes.final:
                        if (!!this.privConversationTranslator) {
                            this.privConversationTranslator.transcribed(this.privConversationTranslator, new ConversationTranslationEventArgs(e.payload, undefined, e.sessionId));
                        }
                        break;
                    case ConversationTranslatorMessageTypes.partial:
                        if (!!this.privConversationTranslator) {
                            this.privConversationTranslator.transcribing(this.privConversationTranslator, new ConversationTranslationEventArgs(e.payload, undefined, e.sessionId));
                        }
                        break;
                    case ConversationTranslatorMessageTypes.instantMessage:
                        if (!!this.privConversationTranslator) {
                            this.privConversationTranslator.textMessageReceived(this.privConversationTranslator, new ConversationTranslationEventArgs(e.payload, undefined, e.sessionId));
                        }
                        break;
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantsListReceived = (r, e) => {
            var _a;
            try {
                // check if the session token needs to be updated
                if (e.sessionToken !== undefined && e.sessionToken !== null) {
                    this.privRoom.token = e.sessionToken;
                }
                // save the participants
                this.privParticipants.participants = [...e.participants];
                // enable the conversation
                if (this.privParticipants.me !== undefined) {
                    this.privIsReady = true;
                }
                if (!!this.privConversationTranslator) {
                    this.privConversationTranslator.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.JoinedConversation, this.toParticipants(true), e.sessionId));
                }
                // if this is the host, update the nickname if needed
                if (this.me.isHost) {
                    const nickname = (_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.properties.getProperty(PropertyId.ConversationTranslator_Name);
                    if (nickname !== undefined && nickname.length > 0 && nickname !== this.me.displayName) {
                        // issue a change nickname request
                        this.changeNicknameAsync(nickname);
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onConversationExpiration = (r, e) => {
            try {
                if (!!this.privConversationTranslator) {
                    this.privConversationTranslator.conversationExpiration(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
        };
        this.privIsConnected = false;
        this.privIsDisposed = false;
        this.privConversationId = "";
        this.privProperties = new PropertyCollection();
        this.privManager = new ConversationManager();
        // check the speech language
        const language = speechConfig.getProperty(PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage]);
        if (!language) {
            speechConfig.setProperty(PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage], ConversationConnectionConfig.defaultLanguageCode);
        }
        this.privLanguage = speechConfig.getProperty(PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage]);
        this.privConversationId = id;
        // save the speech config for future usage
        this.privConfig = speechConfig;
        // save the config properties
        const configImpl = speechConfig;
        Contracts.throwIfNull(configImpl, "speechConfig");
        this.privProperties = configImpl.properties.clone();
        this.privIsConnected = false;
        this.privParticipants = new InternalParticipants();
        this.privIsReady = false;
        this.privTextMessageMaxLength = 1000;
    }
    // get the internal data about a conversation
    get room() {
        return this.privRoom;
    }
    // get the wrapper for connecting to the websockets
    get connection() {
        return this.privConversationRecognizer; // this.privConnection;
    }
    // get the config
    get config() {
        return this.privConfig;
    }
    // get the meeting Id
    get meetingId() {
        return this.privRoom ? this.privRoom.roomId : this.privConversationId;
    }
    // get the properties
    get properties() {
        return this.privProperties;
    }
    // get the speech language
    get speechRecognitionLanguage() {
        return this.privLanguage;
    }
    get isMutedByHost() {
        var _a, _b;
        return ((_a = this.privParticipants.me) === null || _a === void 0 ? void 0 : _a.isHost) ? false : (_b = this.privParticipants.me) === null || _b === void 0 ? void 0 : _b.isMuted;
    }
    get isConnected() {
        return this.privIsConnected && this.privIsReady;
    }
    get participants() {
        return this.toParticipants(true);
    }
    get me() {
        return this.toParticipant(this.privParticipants.me);
    }
    get host() {
        return this.toParticipant(this.privParticipants.host);
    }
    get transcriberRecognizer() {
        return this.privTranscriberRecognizer;
    }
    get meetingInfo() {
        const convId = this.meetingId;
        const p = this.participants.map((part) => ({
            id: part.id,
            preferredLanguage: part.preferredLanguage,
            voice: part.voice
        }));
        const props = {};
        for (const key of ConversationConnectionConfig.transcriptionEventKeys) {
            const val = this.properties.getProperty(key, "");
            if (val !== "") {
                props[key] = val;
            }
        }
        const info = { id: convId, participants: p, meetingProperties: props };
        return info;
    }
    get canSend() {
        var _a;
        return this.privIsConnected && !((_a = this.privParticipants.me) === null || _a === void 0 ? void 0 : _a.isMuted);
    }
    get canSendAsHost() {
        var _a;
        return this.privIsConnected && ((_a = this.privParticipants.me) === null || _a === void 0 ? void 0 : _a.isHost);
    }
    // get / set the speech auth token
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get authorizationToken() {
        return this.privToken;
    }
    set authorizationToken(value) {
        Contracts.throwIfNullOrWhitespace(value, "authorizationToken");
        this.privToken = value;
    }
    /**
     * Create a new meeting as Host
     * @param cb
     * @param err
     */
    createMeetingAsync(cb, err) {
        try {
            if (!!this.privConversationRecognizer) {
                this.handleError(new Error(this.privErrors.permissionDeniedStart), err);
            }
            this.privManager.createOrJoin(this.privProperties, undefined, ((room) => {
                if (!room) {
                    this.handleError(new Error(this.privErrors.permissionDeniedConnect), err);
                }
                this.privRoom = room;
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Starts a new meeting as host.
     * @param cb
     * @param err
     */
    startMeetingAsync(cb, err) {
        try {
            // check if there is already a recognizer
            if (!!this.privConversationRecognizer) {
                this.handleError(new Error(this.privErrors.permissionDeniedStart), err);
            }
            // check if there is conversation data available
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedConnect);
            // connect to the conversation websocket
            this.privParticipants.meId = this.privRoom.participantId;
            // Because ConversationTranslator manually sets up and manages the connection, Conversation
            // has to forward serviceRecognizer connection events that usually get passed automatically
            this.privConversationRecognizer.connected = this.onConnected;
            this.privConversationRecognizer.disconnected = this.onDisconnected;
            this.privConversationRecognizer.canceled = this.onCanceled;
            this.privConversationRecognizer.participantUpdateCommandReceived = this.onParticipantUpdateCommandReceived;
            this.privConversationRecognizer.lockRoomCommandReceived = this.onLockRoomCommandReceived;
            this.privConversationRecognizer.muteAllCommandReceived = this.onMuteAllCommandReceived;
            this.privConversationRecognizer.participantJoinCommandReceived = this.onParticipantJoinCommandReceived;
            this.privConversationRecognizer.participantLeaveCommandReceived = this.onParticipantLeaveCommandReceived;
            this.privConversationRecognizer.translationReceived = this.onTranslationReceived;
            this.privConversationRecognizer.participantsListReceived = this.onParticipantsListReceived;
            this.privConversationRecognizer.conversationExpiration = this.onConversationExpiration;
            this.privConversationRecognizer.connect(this.privRoom.token, (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Join a meeting as a participant.
     * @param { IParticipant } participant - participant to add
     * @param cb
     * @param err
     */
    addParticipantAsync(participant, cb, err) {
        Contracts.throwIfNullOrUndefined(participant, "Participant");
        marshalPromiseToCallbacks(this.addParticipantImplAsync(participant), cb, err);
    }
    /**
     * Join a meeting as a participant.
     * @param meeting
     * @param nickname
     * @param lang
     * @param cb
     * @param err
     */
    joinMeetingAsync(meetingId, nickname, lang, cb, err) {
        try {
            // TODO
            // if (!!this.privConversationRecognizer) {
            //     throw new Error(this.privErrors.permissionDeniedStart);
            // }
            Contracts.throwIfNullOrWhitespace(meetingId, this.privErrors.invalidArgs.replace("{arg}", "conversationId"));
            Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
            Contracts.throwIfNullOrWhitespace(lang, this.privErrors.invalidArgs.replace("{arg}", "language"));
            // join the conversation
            this.privManager.createOrJoin(this.privProperties, meetingId, ((room) => {
                Contracts.throwIfNullOrUndefined(room, this.privErrors.permissionDeniedConnect);
                this.privRoom = room;
                this.privConfig.authorizationToken = room.cognitiveSpeechAuthToken;
                // join callback
                if (!!cb) {
                    cb(room.cognitiveSpeechAuthToken);
                }
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Deletes a meeting
     * @param cb
     * @param err
     */
    deleteMeetingAsync(cb, err) {
        marshalPromiseToCallbacks(this.deleteMeetingImplAsync(), cb, err);
    }
    deleteMeetingImplAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            Contracts.throwIfNullOrUndefined(this.privProperties, this.privErrors.permissionDeniedConnect);
            Contracts.throwIfNullOrWhitespace(this.privRoom.token, this.privErrors.permissionDeniedConnect);
            yield this.privManager.leave(this.privProperties, this.privRoom.token);
            this.dispose();
        });
    }
    /**
     * Issues a request to close the client websockets
     * @param cb
     * @param err
     */
    endMeetingAsync(cb, err) {
        marshalPromiseToCallbacks(this.endMeetingImplAsync(), cb, err);
    }
    endMeetingImplAsync() {
        return this.close(true);
    }
    /**
     * Issues a request to lock the conversation
     * @param cb
     * @param err
     */
    lockMeetingAsync(cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "lock")), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getLockCommand(true), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to mute the meeting
     * @param cb
     * @param err
     */
    muteAllParticipantsAsync(cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privConversationRecognizer, this.privErrors.permissionDeniedSend);
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            // check the user's permissions
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "mute")), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getMuteAllCommand(true), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to mute a participant in the meeting
     * @param userId
     * @param cb
     * @param err
     */
    muteParticipantAsync(userId, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(userId, this.privErrors.invalidArgs.replace("{arg}", "userId"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            // check the connection is open (host + participant can perform the mute command)
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            // if not host, check the participant is not muting another participant
            if (!this.me.isHost && this.me.id !== userId) {
                this.handleError(new Error(this.privErrors.permissionDeniedParticipant.replace("{command}", "mute")), err);
            }
            // check the user exists
            const exists = this.privParticipants.getParticipantIndex(userId);
            if (exists === -1) {
                this.handleError(new Error(this.privErrors.invalidParticipantRequest), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getMuteCommand(userId, true), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to remove a participant from the conversation
     * @param userId
     * @param cb
     * @param err
     */
    removeParticipantAsync(userId, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            if (!!this.privTranscriberRecognizer && userId.hasOwnProperty("id")) {
                // Assume this is a transcription participant
                marshalPromiseToCallbacks(this.removeParticipantImplAsync(userId), cb, err);
            }
            else {
                Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
                Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
                if (!this.canSendAsHost) {
                    this.handleError(new Error(this.privErrors.permissionDeniedParticipant.replace("{command}", "remove")), err);
                }
                let participantId = "";
                if (typeof userId === "string") {
                    participantId = userId;
                }
                else if (userId.hasOwnProperty("id")) {
                    const participant = userId;
                    participantId = participant.id;
                }
                else if (userId.hasOwnProperty("userId")) {
                    const user = userId;
                    participantId = user.userId;
                }
                Contracts.throwIfNullOrWhitespace(participantId, this.privErrors.invalidArgs.replace("{arg}", "userId"));
                // check the participant exists
                const index = this.participants.findIndex((p) => p.id === participantId);
                if (index === -1) {
                    this.handleError(new Error(this.privErrors.invalidParticipantRequest), err);
                }
                if (!!this.privConversationRecognizer) {
                    this.privConversationRecognizer.sendRequest(this.getEjectCommand(participantId), (() => {
                        this.handleCallback(cb, err);
                    }), ((error) => {
                        this.handleError(error, err);
                    }));
                }
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to unlock the meeting
     * @param cb
     * @param err
     */
    unlockMeetingAsync(cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "unlock")), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getLockCommand(false), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to unmute all participants in the meeting
     * @param cb
     * @param err
     */
    unmuteAllParticipantsAsync(cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "unmute all")), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getMuteAllCommand(false), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to unmute a participant in the meeting
     * @param userId
     * @param cb
     * @param err
     */
    unmuteParticipantAsync(userId, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(userId, this.privErrors.invalidArgs.replace("{arg}", "userId"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            // check the connection is open (host + participant can perform the mute command)
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            // if not host, check the participant is not muting another participant
            if (!this.me.isHost && this.me.id !== userId) {
                this.handleError(new Error(this.privErrors.permissionDeniedParticipant.replace("{command}", "mute")), err);
            }
            // check the user exists
            const exists = this.privParticipants.getParticipantIndex(userId);
            if (exists === -1) {
                this.handleError(new Error(this.privErrors.invalidParticipantRequest), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getMuteCommand(userId, false), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Send a text message
     * @param message
     * @param cb
     * @param err
     */
    sendTextMessageAsync(message, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(message, this.privErrors.invalidArgs.replace("{arg}", "message"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            // TODO: is a max length check required?
            if (message.length > this.privTextMessageMaxLength) {
                this.handleError(new Error(this.privErrors.invalidArgs.replace("{arg}", "message length")), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getMessageCommand(message), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Set translated to languages
     * @param {string[]} languages - languages to translate to
     * @param cb
     * @param err
     */
    setTranslatedLanguagesAsync(languages, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfArrayEmptyOrWhitespace(languages, this.privErrors.invalidArgs.replace("{arg}", "languages"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getSetTranslateToLanguagesCommand(languages), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Change nickname
     * @param {string} nickname - new nickname for the room
     * @param cb
     * @param err
     */
    changeNicknameAsync(nickname, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            if (!!this.privConversationRecognizer) {
                this.privConversationRecognizer.sendRequest(this.getChangeNicknameCommand(nickname), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    isDisposed() {
        return this.privIsDisposed;
    }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.privIsDisposed = true;
        if (!!this.config) {
            this.config.close();
        }
        this.privConfig = undefined;
        this.privLanguage = undefined;
        this.privProperties = undefined;
        this.privRoom = undefined;
        this.privToken = undefined;
        this.privManager = undefined;
        this.privIsConnected = false;
        this.privIsReady = false;
        this.privParticipants = undefined;
    }
    connectTranscriberRecognizer(recognizer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.privTranscriberRecognizer) {
                yield this.privTranscriberRecognizer.close();
            }
            yield recognizer.enforceAudioGating();
            this.privTranscriberRecognizer = recognizer;
            this.privTranscriberRecognizer.meeting = this;
        });
    }
    getKeepAlive() {
        const nickname = (!!this.me) ? this.me.displayName : "default_nickname";
        return JSON.stringify({
            id: "0",
            nickname,
            participantId: this.privRoom.participantId,
            roomId: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.keepAlive
        });
    }
    /* eslint-enable @typescript-eslint/typedef */
    addParticipantImplAsync(participant) {
        const newParticipant = this.privParticipants.addOrUpdateParticipant(participant);
        if (newParticipant !== undefined) {
            if (!!this.privTranscriberRecognizer) {
                const meetingInfo = this.meetingInfo;
                meetingInfo.participants = [participant];
                return this.privTranscriberRecognizer.pushMeetingEvent(meetingInfo, "join");
            }
        }
    }
    removeParticipantImplAsync(participant) {
        this.privParticipants.deleteParticipant(participant.id);
        const meetingInfo = this.meetingInfo;
        meetingInfo.participants = [participant];
        return this.privTranscriberRecognizer.pushMeetingEvent(meetingInfo, "leave");
    }
    close(dispose) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.privIsConnected = false;
                yield ((_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.close());
                this.privConversationRecognizer = undefined;
                if (!!this.privConversationTranslator) {
                    this.privConversationTranslator.dispose();
                }
            }
            catch (e) {
                // ignore error
                throw e;
            }
            if (dispose) {
                this.dispose();
            }
        });
    }
    /** Helpers */
    handleCallback(cb, err) {
        if (!!cb) {
            try {
                cb();
            }
            catch (e) {
                if (!!err) {
                    err(e);
                }
            }
            cb = undefined;
        }
    }
    handleError(error, err) {
        if (!!err) {
            if (error instanceof Error) {
                const typedError = error;
                err(typedError.name + ": " + typedError.message);
            }
            else {
                err(error);
            }
        }
    }
    /** Participant Helpers */
    toParticipants(includeHost) {
        const participants = this.privParticipants.participants.map((p) => (this.toParticipant(p)));
        if (!includeHost) {
            return participants.filter((p) => p.isHost === false);
        }
        else {
            return participants;
        }
    }
    toParticipant(p) {
        return new Participant(p.id, p.avatar, p.displayName, p.isHost, p.isMuted, p.isUsingTts, p.preferredLanguage, p.voice);
    }
    getMuteAllCommand(isMuted) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "meetingd");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.setMuteAll,
            participantId: this.privRoom.participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: isMuted
        });
    }
    getMuteCommand(participantId, isMuted) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "conversationId");
        Contracts.throwIfNullOrWhitespace(participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.setMute,
            // eslint-disable-next-line object-shorthand
            participantId: participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: isMuted
        });
    }
    getLockCommand(isLocked) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "meetingId");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.setLockState,
            participantId: this.privRoom.participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: isLocked
        });
    }
    getEjectCommand(participantId) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "meetingId");
        Contracts.throwIfNullOrWhitespace(participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.ejectParticipant,
            // eslint-disable-next-line object-shorthand
            participantId: participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
        });
    }
    getSetTranslateToLanguagesCommand(languages) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "meetingId");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.setTranslateToLanguages,
            participantId: this.privRoom.participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: languages
        });
    }
    getChangeNicknameCommand(nickname) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "meetingId");
        Contracts.throwIfNullOrWhitespace(nickname, "nickname");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.changeNickname,
            nickname,
            participantId: this.privRoom.participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: nickname
        });
    }
    getMessageCommand(message) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "meetingId");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        Contracts.throwIfNullOrWhitespace(message, "message");
        return JSON.stringify({
            participantId: this.privRoom.participantId,
            roomId: this.privRoom.roomId,
            text: message,
            type: ConversationTranslatorMessageTypes.instantMessage
        });
    }
}

//# sourceMappingURL=Meeting.js.map
