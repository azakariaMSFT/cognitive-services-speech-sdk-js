/**
 * Defines speech property ids.
 * @class PropertyId
 */
export declare enum PropertyId {
    /**
     * The Cognitive Services Speech Service subscription Key. If you are using an intent recognizer, you need to
     * specify the LUIS endpoint key for your particular LUIS app. Under normal circumstances, you shouldn't
     * have to use this property directly.
     * Instead, use [[SpeechConfig.fromSubscription]].
     * @member PropertyId.SpeechServiceConnection_Key
     */
    SpeechServiceConnection_Key = 0,
    /**
     * The Cognitive Services Speech Service endpoint (url). Under normal circumstances, you shouldn't
     * have to use this property directly.
     * Instead, use [[SpeechConfig.fromEndpoint]].
     * NOTE: This endpoint is not the same as the endpoint used to obtain an access token.
     * @member PropertyId.SpeechServiceConnection_Endpoint
     */
    SpeechServiceConnection_Endpoint = 1,
    /**
     * The Cognitive Services Speech Service region. Under normal circumstances, you shouldn't have to
     * use this property directly.
     * Instead, use [[SpeechConfig.fromSubscription]], [[SpeechConfig.fromEndpoint]], [[SpeechConfig.fromAuthorizationToken]].
     * @member PropertyId.SpeechServiceConnection_Region
     */
    SpeechServiceConnection_Region = 2,
    /**
     * The Cognitive Services Speech Service authorization token (aka access token). Under normal circumstances,
     * you shouldn't have to use this property directly.
     * Instead, use [[SpeechConfig.fromAuthorizationToken]], [[SpeechRecognizer.authorizationToken]],
     * [[IntentRecognizer.authorizationToken]], [[TranslationRecognizer.authorizationToken]], [[SpeakerRecognizer.authorizationToken]].
     * @member PropertyId.SpeechServiceAuthorization_Token
     */
    SpeechServiceAuthorization_Token = 3,
    /**
     * The Cognitive Services Speech Service authorization type. Currently unused.
     * @member PropertyId.SpeechServiceAuthorization_Type
     */
    SpeechServiceAuthorization_Type = 4,
    /**
     * The Cognitive Services Speech Service endpoint id. Under normal circumstances, you shouldn't
     * have to use this property directly.
     * Instead, use [[SpeechConfig.endpointId]].
     * NOTE: The endpoint id is available in the Speech Portal, listed under Endpoint Details.
     * @member PropertyId.SpeechServiceConnection_EndpointId
     */
    SpeechServiceConnection_EndpointId = 5,
    /**
     * The list of comma separated languages (BCP-47 format) used as target translation languages. Under normal circumstances,
     * you shouldn't have to use this property directly.
     * Instead use [[SpeechTranslationConfig.addTargetLanguage]],
     * [[SpeechTranslationConfig.targetLanguages]], [[TranslationRecognizer.targetLanguages]].
     * @member PropertyId.SpeechServiceConnection_TranslationToLanguages
     */
    SpeechServiceConnection_TranslationToLanguages = 6,
    /**
     * The name of the Cognitive Service Text to Speech Service Voice. Under normal circumstances, you shouldn't have to use this
     * property directly.
     * Instead, use [[SpeechTranslationConfig.voiceName]].
     * NOTE: Valid voice names can be found <a href="https://aka.ms/csspeech/voicenames">here</a>.
     * @member PropertyId.SpeechServiceConnection_TranslationVoice
     */
    SpeechServiceConnection_TranslationVoice = 7,
    /**
     * Translation features.
     * @member PropertyId.SpeechServiceConnection_TranslationFeatures
     */
    SpeechServiceConnection_TranslationFeatures = 8,
    /**
     * The Language Understanding Service Region. Under normal circumstances, you shouldn't have to use this property directly.
     * Instead, use [[LanguageUnderstandingModel]].
     * @member PropertyId.SpeechServiceConnection_IntentRegion
     */
    SpeechServiceConnection_IntentRegion = 9,
    /**
     * The host name of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    SpeechServiceConnection_ProxyHostName = 10,
    /**
     * The port of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    SpeechServiceConnection_ProxyPort = 11,
    /**
     * The user name of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    SpeechServiceConnection_ProxyUserName = 12,
    /**
     * The password of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    SpeechServiceConnection_ProxyPassword = 13,
    /**
     * The Cognitive Services Speech Service recognition Mode. Can be "INTERACTIVE", "CONVERSATION", "DICTATION".
     * This property is intended to be read-only. The SDK is using it internally.
     * @member PropertyId.SpeechServiceConnection_RecoMode
     */
    SpeechServiceConnection_RecoMode = 14,
    /**
     * The spoken language to be recognized (in BCP-47 format). Under normal circumstances, you shouldn't have to use this property
     * directly.
     * Instead, use [[SpeechConfig.speechRecognitionLanguage]].
     * @member PropertyId.SpeechServiceConnection_RecoLanguage
     */
    SpeechServiceConnection_RecoLanguage = 15,
    /**
     * The session id. This id is a universally unique identifier (aka UUID) representing a specific binding of an audio input stream
     * and the underlying speech recognition instance to which it is bound. Under normal circumstances, you shouldn't have to use this
     * property directly.
     * Instead use [[SessionEventArgs.sessionId]].
     * @member PropertyId.Speech_SessionId
     */
    Speech_SessionId = 16,
    /**
     * The spoken language to be synthesized (e.g. en-US)
     * @member PropertyId.SpeechServiceConnection_SynthLanguage
     */
    SpeechServiceConnection_SynthLanguage = 17,
    /**
     * The name of the TTS voice to be used for speech synthesis
     * @member PropertyId.SpeechServiceConnection_SynthVoice
     */
    SpeechServiceConnection_SynthVoice = 18,
    /**
     * The string to specify TTS output audio format
     * @member PropertyId.SpeechServiceConnection_SynthOutputFormat
     */
    SpeechServiceConnection_SynthOutputFormat = 19,
    /**
     * The list of comma separated languages used as possible source languages
     * Added in version 1.13.0
     * @member PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages
     */
    SpeechServiceConnection_AutoDetectSourceLanguages = 20,
    /**
     * The requested Cognitive Services Speech Service response output format (simple or detailed). Under normal circumstances, you shouldn't have
     * to use this property directly.
     * Instead use [[SpeechConfig.outputFormat]].
     * @member PropertyId.SpeechServiceResponse_RequestDetailedResultTrueFalse
     */
    SpeechServiceResponse_RequestDetailedResultTrueFalse = 21,
    /**
     * The requested Cognitive Services Speech Service response output profanity level. Currently unused.
     * @member PropertyId.SpeechServiceResponse_RequestProfanityFilterTrueFalse
     */
    SpeechServiceResponse_RequestProfanityFilterTrueFalse = 22,
    /**
     * The Cognitive Services Speech Service response output (in JSON format). This property is available on recognition result objects only.
     * @member PropertyId.SpeechServiceResponse_JsonResult
     */
    SpeechServiceResponse_JsonResult = 23,
    /**
     * The Cognitive Services Speech Service error details (in JSON format). Under normal circumstances, you shouldn't have to
     * use this property directly. Instead use [[CancellationDetails.errorDetails]].
     * @member PropertyId.SpeechServiceResponse_JsonErrorDetails
     */
    SpeechServiceResponse_JsonErrorDetails = 24,
    /**
     * The cancellation reason. Currently unused.
     * @member PropertyId.CancellationDetails_Reason
     */
    CancellationDetails_Reason = 25,
    /**
     * The cancellation text. Currently unused.
     * @member PropertyId.CancellationDetails_ReasonText
     */
    CancellationDetails_ReasonText = 26,
    /**
     * The Cancellation detailed text. Currently unused.
     * @member PropertyId.CancellationDetails_ReasonDetailedText
     */
    CancellationDetails_ReasonDetailedText = 27,
    /**
     * The Language Understanding Service response output (in JSON format). Available via [[IntentRecognitionResult]]
     * @member PropertyId.LanguageUnderstandingServiceResponse_JsonResult
     */
    LanguageUnderstandingServiceResponse_JsonResult = 28,
    /**
     * The URL string built from speech configuration.
     * This property is intended to be read-only. The SDK is using it internally.
     * NOTE: Added in version 1.7.0.
     */
    SpeechServiceConnection_Url = 29,
    /**
     * The initial silence timeout value (in milliseconds) used by the service.
     * Added in version 1.7.0
     */
    SpeechServiceConnection_InitialSilenceTimeoutMs = 30,
    /**
     * The end silence timeout value (in milliseconds) used by the service.
     * Added in version 1.7.0
     */
    SpeechServiceConnection_EndSilenceTimeoutMs = 31,
    /**
     * A duration of detected silence, measured in milliseconds, after which speech-to-text will determine a spoken
     * phrase has ended and generate a final Recognized result. Configuring this timeout may be helpful in situations
     * where spoken input is significantly faster or slower than usual and default segmentation behavior consistently
     * yields results that are too long or too short. Segmentation timeout values that are inappropriately high or low
     * can negatively affect speech-to-text accuracy; this property should be carefully configured and the resulting
     * behavior should be thoroughly validated as intended.
     *
     * For more information about timeout configuration that includes discussion of default behaviors, please visit
     * https://aka.ms/csspeech/timeouts.
     *
     * Added in version 1.21.0.
     */
    Speech_SegmentationSilenceTimeoutMs = 32,
    /**
     * A boolean value specifying whether audio logging is enabled in the service or not.
     * Audio and content logs are stored either in Microsoft-owned storage, or in your own storage account linked
     * to your Cognitive Services subscription (Bring Your Own Storage (BYOS) enabled Speech resource).
     * The logs will be removed after 30 days.
     * Added in version 1.7.0
     */
    SpeechServiceConnection_EnableAudioLogging = 33,
    /**
     * The speech service connection language identifier mode.
     * Can be "AtStart" (the default), or "Continuous". See Language
     * Identification document https://aka.ms/speech/lid?pivots=programming-language-javascript
     * for more details.
     * Added in 1.25.0
     **/
    SpeechServiceConnection_LanguageIdMode = 34,
    /**
     * A string value representing the desired endpoint version to target for Speech Recognition.
     * Added in version 1.21.0
     */
    SpeechServiceConnection_RecognitionEndpointVersion = 35,
    /**
    /**
     * A string value the current speaker recognition scenario/mode (TextIndependentIdentification, etc.).
     * Added in version 1.23.0
     */
    SpeechServiceConnection_SpeakerIdMode = 36,
    /**
     * The requested Cognitive Services Speech Service response output profanity setting.
     * Allowed values are "masked", "removed", and "raw".
     * Added in version 1.7.0.
     */
    SpeechServiceResponse_ProfanityOption = 37,
    /**
     * A string value specifying which post processing option should be used by service.
     * Allowed values are "TrueText".
     * Added in version 1.7.0
     */
    SpeechServiceResponse_PostProcessingOption = 38,
    /**
     * A boolean value specifying whether to include word-level timestamps in the response result.
     * Added in version 1.7.0
     */
    SpeechServiceResponse_RequestWordLevelTimestamps = 39,
    /**
     * The number of times a word has to be in partial results to be returned.
     * Added in version 1.7.0
     */
    SpeechServiceResponse_StablePartialResultThreshold = 40,
    /**
     * A string value specifying the output format option in the response result. Internal use only.
     * Added in version 1.7.0.
     */
    SpeechServiceResponse_OutputFormatOption = 41,
    /**
     * A boolean value to request for stabilizing translation partial results by omitting words in the end.
     * Added in version 1.7.0.
     */
    SpeechServiceResponse_TranslationRequestStablePartialResult = 42,
    /**
     * A boolean value specifying whether to request WordBoundary events.
     * @member PropertyId.SpeechServiceResponse_RequestWordBoundary
     * Added in version 1.21.0.
     */
    SpeechServiceResponse_RequestWordBoundary = 43,
    /**
     * A boolean value specifying whether to request punctuation boundary in WordBoundary Events. Default is true.
     * @member PropertyId.SpeechServiceResponse_RequestPunctuationBoundary
     * Added in version 1.21.0.
     */
    SpeechServiceResponse_RequestPunctuationBoundary = 44,
    /**
     * A boolean value specifying whether to request sentence boundary in WordBoundary Events. Default is false.
     * @member PropertyId.SpeechServiceResponse_RequestSentenceBoundary
     * Added in version 1.21.0.
     */
    SpeechServiceResponse_RequestSentenceBoundary = 45,
    /**
     * Identifier used to connect to the backend service.
     * @member PropertyId.Conversation_ApplicationId
     */
    Conversation_ApplicationId = 46,
    /**
     * Type of dialog backend to connect to.
     * @member PropertyId.Conversation_DialogType
     */
    Conversation_DialogType = 47,
    /**
     * Silence timeout for listening
     * @member PropertyId.Conversation_Initial_Silence_Timeout
     */
    Conversation_Initial_Silence_Timeout = 48,
    /**
     * From Id to add to speech recognition activities.
     * @member PropertyId.Conversation_From_Id
     */
    Conversation_From_Id = 49,
    /**
     * ConversationId for the session.
     * @member PropertyId.Conversation_Conversation_Id
     */
    Conversation_Conversation_Id = 50,
    /**
     * Comma separated list of custom voice deployment ids.
     * @member PropertyId.Conversation_Custom_Voice_Deployment_Ids
     */
    Conversation_Custom_Voice_Deployment_Ids = 51,
    /**
     * Speech activity template, stamp properties from the template on the activity generated by the service for speech.
     * @member PropertyId.Conversation_Speech_Activity_Template
     * Added in version 1.10.0.
     */
    Conversation_Speech_Activity_Template = 52,
    /**
     * Enables or disables the receipt of turn status messages as obtained on the turnStatusReceived event.
     * @member PropertyId.Conversation_Request_Bot_Status_Messages
     * Added in version 1.15.0.
     */
    Conversation_Request_Bot_Status_Messages = 53,
    /**
     * Specifies the connection ID to be provided in the Agent configuration message, e.g. a Direct Line token for
     * channel authentication.
     * Added in version 1.15.1.
     */
    Conversation_Agent_Connection_Id = 54,
    /**
     * The Cognitive Services Speech Service host (url). Under normal circumstances, you shouldn't have to use this property directly.
     * Instead, use [[SpeechConfig.fromHost]].
     */
    SpeechServiceConnection_Host = 55,
    /**
     * Set the host for service calls to the Conversation Translator REST management and websocket calls.
     */
    ConversationTranslator_Host = 56,
    /**
     * Optionally set the the host's display name.
     * Used when joining a conversation.
     */
    ConversationTranslator_Name = 57,
    /**
     * Optionally set a value for the X-CorrelationId request header.
     * Used for troubleshooting errors in the server logs. It should be a valid guid.
     */
    ConversationTranslator_CorrelationId = 58,
    /**
     * Set the conversation token to be sent to the speech service. This enables the
     * service to service call from the speech service to the Conversation Translator service for relaying
     * recognitions. For internal use.
     */
    ConversationTranslator_Token = 59,
    /**
     * The reference text of the audio for pronunciation evaluation.
     * For this and the following pronunciation assessment parameters, see
     * https://docs.microsoft.com/azure/cognitive-services/speech-service/rest-speech-to-text#pronunciation-assessment-parameters for details.
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PronunciationAssessment_ReferenceText = 60,
    /**
     * The point system for pronunciation score calibration (FivePoint or HundredMark).
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PronunciationAssessment_GradingSystem = 61,
    /**
     * The pronunciation evaluation granularity (Phoneme, Word, or FullText).
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PronunciationAssessment_Granularity = 62,
    /**
     * Defines if enable miscue calculation.
     * With this enabled, the pronounced words will be compared to the reference text,
     * and will be marked with omission/insertion based on the comparison. The default setting is False.
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PronunciationAssessment_EnableMiscue = 63,
    /**
     * The json string of pronunciation assessment parameters
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PronunciationAssessment_Json = 64,
    /**
     * Pronunciation assessment parameters.
     * This property is intended to be read-only. The SDK is using it internally.
     * Added in version 1.15.0
     */
    PronunciationAssessment_Params = 65,
    /**
     * Version of Speaker Recognition API to use.
     * Added in version 1.18.0
     */
    SpeakerRecognition_Api_Version = 66,
    /**
     * Specifies whether to allow load of data URL for web worker
     * Allowed values are "off" and "on". Default is "on".
     * Added in version 1.32.0
     */
    WebWorkerLoadType = 67,
    /**
     * Talking avatar service WebRTC session description protocol.
     * This property is intended to be read-only. The SDK is using it internally.
     * Added in version 1.33.0
     */
    TalkingAvatarService_WebRTC_SDP = 68
}
