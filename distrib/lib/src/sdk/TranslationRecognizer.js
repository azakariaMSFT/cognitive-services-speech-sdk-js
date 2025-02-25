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
import { RecognitionMode, RecognizerConfig, TranslationConnectionFactory, TranslationServiceRecognizer } from "../common.speech/Exports.js";
import { marshalPromiseToCallbacks } from "../common/Exports.js";
import { Connection } from "./Connection.js";
import { Contracts } from "./Contracts.js";
import { PropertyId, Recognizer } from "./Exports.js";
/**
 * Translation recognizer
 * @class TranslationRecognizer
 */
export class TranslationRecognizer extends Recognizer {
    /**
     * Initializes an instance of the TranslationRecognizer.
     * @constructor
     * @param {SpeechTranslationConfig} speechConfig - Set of properties to configure this recognizer.
     * @param {AudioConfig} audioConfig - An optional audio config associated with the recognizer
     * @param {IConnectionFactory} connectionFactory - An optional connection factory to use to generate the endpoint URIs, headers to set, etc...
     */
    constructor(speechConfig, audioConfig, connectionFactory) {
        const configImpl = speechConfig;
        Contracts.throwIfNull(configImpl, "speechConfig");
        super(audioConfig, configImpl.properties, connectionFactory || new TranslationConnectionFactory());
        this.privDisposedTranslationRecognizer = false;
        if (this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice, undefined) !== undefined) {
            Contracts.throwIfNullOrWhitespace(this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice), PropertyId[PropertyId.SpeechServiceConnection_TranslationVoice]);
        }
        Contracts.throwIfNullOrWhitespace(this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages), PropertyId[PropertyId.SpeechServiceConnection_TranslationToLanguages]);
        Contracts.throwIfNullOrWhitespace(this.properties.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage), PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage]);
    }
    /**
     * TranslationRecognizer constructor.
     * @constructor
     * @param {SpeechTranslationConfig} speechTranslationConfig - an set of initial properties for this recognizer
     * @param {AutoDetectSourceLanguageConfig} autoDetectSourceLanguageConfig - An source language detection configuration associated with the recognizer
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the recognizer
     */
    static FromConfig(speechTranslationConfig, autoDetectSourceLanguageConfig, audioConfig) {
        const speechTranslationConfigImpl = speechTranslationConfig;
        autoDetectSourceLanguageConfig.properties.mergeTo(speechTranslationConfigImpl.properties);
        return new TranslationRecognizer(speechTranslationConfig, audioConfig);
    }
    /**
     * Gets the language name that was set when the recognizer was created.
     * @member TranslationRecognizer.prototype.speechRecognitionLanguage
     * @function
     * @public
     * @returns {string} Gets the language name that was set when the recognizer was created.
     */
    get speechRecognitionLanguage() {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage);
    }
    /**
     * Gets target languages for translation that were set when the recognizer was created.
     * The language is specified in BCP-47 format. The translation will provide translated text for each of language.
     * @member TranslationRecognizer.prototype.targetLanguages
     * @function
     * @public
     * @returns {string[]} Gets target languages for translation that were set when the recognizer was created.
     */
    get targetLanguages() {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages).split(",");
    }
    /**
     * Gets the name of output voice.
     * @member TranslationRecognizer.prototype.voiceName
     * @function
     * @public
     * @returns {string} the name of output voice.
     */
    get voiceName() {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice, undefined);
    }
    /**
     * The collection of properties and their values defined for this TranslationRecognizer.
     * @member TranslationRecognizer.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this TranslationRecognizer.
     */
    get properties() {
        return this.privProperties;
    }
    /**
     * Gets the authorization token used to communicate with the service.
     * @member TranslationRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member TranslationRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @param {string} value - Authorization token.
     */
    set authorizationToken(value) {
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, value);
    }
    /**
     * Starts recognition and translation, and stops after the first utterance is recognized.
     * The task returns the translation text as result.
     * Note: recognizeOnceAsync returns when the first utterance has been recognized, so it is suitable only
     * for single shot recognition like command or query. For long-running recognition,
     * use startContinuousRecognitionAsync() instead.
     * @member TranslationRecognizer.prototype.recognizeOnceAsync
     * @function
     * @public
     * @param cb - Callback that received the result when the translation has completed.
     * @param err - Callback invoked in case of an error.
     */
    recognizeOnceAsync(cb, err) {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        marshalPromiseToCallbacks(this.recognizeOnceAsyncImpl(RecognitionMode.Interactive), cb, err);
    }
    /**
     * Starts recognition and translation, until stopContinuousRecognitionAsync() is called.
     * User must subscribe to events to receive translation results.
     * @member TranslationRecognizer.prototype.startContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback that received the translation has started.
     * @param err - Callback invoked in case of an error.
     */
    startContinuousRecognitionAsync(cb, err) {
        marshalPromiseToCallbacks(this.startContinuousRecognitionAsyncImpl(RecognitionMode.Conversation), cb, err);
    }
    /**
     * Stops continuous recognition and translation.
     * @member TranslationRecognizer.prototype.stopContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback that received the translation has stopped.
     * @param err - Callback invoked in case of an error.
     */
    stopContinuousRecognitionAsync(cb, err) {
        marshalPromiseToCallbacks(this.stopContinuousRecognitionAsyncImpl(), cb, err);
    }
    /**
     * dynamically remove a language from list of target language
     * (can be used while recognition is ongoing)
     * @member TranslationRecognizer.prototype.removeTargetLanguage
     * @function
     * @param lang - language to be removed
     * @public
     */
    removeTargetLanguage(lang) {
        Contracts.throwIfNullOrUndefined(lang, "language to be removed");
        if (this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages, undefined) !== undefined) {
            const languages = this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages).split(",");
            const index = languages.indexOf(lang);
            if (index > -1) {
                languages.splice(index, 1);
                this.properties.setProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages, languages.join(","));
                this.updateLanguages(languages);
            }
        }
    }
    /**
     * dynamically add a language to list of target language
     * (can be used while recognition is ongoing)
     * @member TranslationRecognizer.prototype.addTargetLanguage
     * @function
     * @param lang - language to be added
     * @public
     */
    addTargetLanguage(lang) {
        Contracts.throwIfNullOrUndefined(lang, "language to be added");
        let languages = [];
        if (this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages, undefined) !== undefined) {
            languages = this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages).split(",");
            if (!languages.includes(lang)) {
                languages.push(lang);
                this.properties.setProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages, languages.join(","));
            }
        }
        else {
            this.properties.setProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages, lang);
            languages = [lang];
        }
        this.updateLanguages(languages);
    }
    /**
     * closes all external resources held by an instance of this class.
     * @member TranslationRecognizer.prototype.close
     * @function
     * @public
     */
    close(cb, errorCb) {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        marshalPromiseToCallbacks(this.dispose(true), cb, errorCb);
    }
    /**
     * handles ConnectionEstablishedEvent for conversation translation scenarios.
     * @member TranslationRecognizer.prototype.onConnection
     * @function
     * @public
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConnection() { }
    dispose(disposing) {
        const _super = Object.create(null, {
            dispose: { get: () => super.dispose }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.privDisposedTranslationRecognizer) {
                return;
            }
            this.privDisposedTranslationRecognizer = true;
            if (disposing) {
                yield this.implRecognizerStop();
                yield _super.dispose.call(this, disposing);
            }
        });
    }
    createRecognizerConfig(speechConfig) {
        return new RecognizerConfig(speechConfig, this.privProperties);
    }
    createServiceRecognizer(authentication, connectionFactory, audioConfig, recognizerConfig) {
        const configImpl = audioConfig;
        return new TranslationServiceRecognizer(authentication, connectionFactory, configImpl, recognizerConfig, this);
    }
    updateLanguages(languages) {
        const conn = Connection.fromRecognizer(this);
        if (!!conn) {
            conn.setMessageProperty("speech.context", "translationcontext", { to: languages });
            conn.sendMessageAsync("event", JSON.stringify({
                id: "translation",
                name: "updateLanguage",
                to: languages
            }));
        }
    }
}

//# sourceMappingURL=TranslationRecognizer.js.map
