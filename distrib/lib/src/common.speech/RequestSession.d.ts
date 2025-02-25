import { ReplayableAudioNode } from "../common.browser/Exports.js";
import { IEventSource, PlatformEvent } from "../common/Exports.js";
import { SpeechRecognitionEvent } from "./RecognitionEvents.js";
export declare class RequestSession {
    private privIsDisposed;
    private privServiceTelemetryListener;
    private privDetachables;
    private privRequestId;
    private privAudioSourceId;
    private privAudioNodeId;
    private privAudioNode;
    private privAuthFetchEventId;
    private privIsAudioNodeDetached;
    private privIsRecognizing;
    private privIsSpeechEnded;
    private privTurnStartAudioOffset;
    private privLastRecoOffset;
    private privHypothesisReceived;
    private privBytesSent;
    private privRecognitionBytesSent;
    private privRecogNumber;
    private privSessionId;
    private privTurnDeferral;
    private privInTurn;
    private privConnectionAttempts;
    constructor(audioSourceId: string);
    get sessionId(): string;
    get requestId(): string;
    get audioNodeId(): string;
    get turnCompletionPromise(): Promise<void>;
    get isSpeechEnded(): boolean;
    get isRecognizing(): boolean;
    get currentTurnAudioOffset(): number;
    get recogNumber(): number;
    get numConnectionAttempts(): number;
    get bytesSent(): number;
    get recognitionBytesSent(): number;
    listenForServiceTelemetry(eventSource: IEventSource<PlatformEvent>): void;
    startNewRecognition(): void;
    onAudioSourceAttachCompleted(audioNode: ReplayableAudioNode, isError: boolean): Promise<void>;
    onPreConnectionStart(authFetchEventId: string, connectionId: string): void;
    onAuthCompleted(isError: boolean): Promise<void>;
    onConnectionEstablishCompleted(statusCode: number, reason?: string): Promise<void>;
    onServiceTurnEndResponse(continuousRecognition: boolean): Promise<void>;
    onSpeechContext(): void;
    onServiceTurnStartResponse(): void;
    onHypothesis(offset: number): void;
    onPhraseRecognized(offset: number): void;
    onServiceRecognized(offset: number): void;
    onAudioSent(bytesSent: number): void;
    onRetryConnection(): void;
    dispose(): Promise<void>;
    getTelemetry(): string;
    onStopRecognizing(): Promise<void>;
    onSpeechEnded(): void;
    protected onEvent(event: SpeechRecognitionEvent): void;
    private onComplete;
    private detachAudioNode;
}
