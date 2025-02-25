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
import { connectivity, type, } from "../common.speech/Exports.js";
import { AudioSourceErrorEvent, AudioSourceInitializingEvent, AudioSourceOffEvent, AudioSourceReadyEvent, AudioStreamNodeAttachedEvent, AudioStreamNodeAttachingEvent, AudioStreamNodeDetachedEvent, AudioStreamNodeErrorEvent, ChunkedArrayBufferStream, createNoDashGuid, Deferred, Events, EventSource, } from "../common/Exports.js";
import { AudioStreamFormat } from "../sdk/Audio/AudioStreamFormat.js";
export class FileAudioSource {
    constructor(file, filename, audioSourceId) {
        this.privStreams = {};
        this.privHeaderEnd = 44;
        this.privId = audioSourceId ? audioSourceId : createNoDashGuid();
        this.privEvents = new EventSource();
        this.privSource = file;
        if (typeof window !== "undefined" && typeof Blob !== "undefined" && this.privSource instanceof Blob) {
            this.privFilename = file.name;
        }
        else {
            this.privFilename = filename || "unknown.wav";
        }
        // Read the header.
        this.privAudioFormatPromise = this.readHeader();
    }
    get format() {
        return this.privAudioFormatPromise;
    }
    turnOn() {
        if (this.privFilename.lastIndexOf(".wav") !== this.privFilename.length - 4) {
            const errorMsg = this.privFilename + " is not supported. Only WAVE files are allowed at the moment.";
            this.onEvent(new AudioSourceErrorEvent(errorMsg, ""));
            return Promise.reject(errorMsg);
        }
        this.onEvent(new AudioSourceInitializingEvent(this.privId)); // no stream id
        this.onEvent(new AudioSourceReadyEvent(this.privId));
        return;
    }
    id() {
        return this.privId;
    }
    attach(audioNodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
            const stream = yield this.upload(audioNodeId);
            this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId));
            return Promise.resolve({
                detach: () => __awaiter(this, void 0, void 0, function* () {
                    stream.readEnded();
                    delete this.privStreams[audioNodeId];
                    this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
                    yield this.turnOff();
                }),
                id: () => audioNodeId,
                read: () => stream.read(),
            });
        });
    }
    detach(audioNodeId) {
        if (audioNodeId && this.privStreams[audioNodeId]) {
            this.privStreams[audioNodeId].close();
            delete this.privStreams[audioNodeId];
            this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
        }
    }
    turnOff() {
        for (const streamId in this.privStreams) {
            if (streamId) {
                const stream = this.privStreams[streamId];
                if (stream && !stream.isClosed) {
                    stream.close();
                }
            }
        }
        this.onEvent(new AudioSourceOffEvent(this.privId)); // no stream now
        return Promise.resolve();
    }
    get events() {
        return this.privEvents;
    }
    get deviceInfo() {
        return this.privAudioFormatPromise.then((result) => (Promise.resolve({
            bitspersample: result.bitsPerSample,
            channelcount: result.channels,
            connectivity: connectivity.Unknown,
            manufacturer: "Speech SDK",
            model: "File",
            samplerate: result.samplesPerSec,
            type: type.File,
        })));
    }
    readHeader() {
        // Read the wave header.
        const maxHeaderSize = 4296;
        const header = this.privSource.slice(0, maxHeaderSize);
        const headerResult = new Deferred();
        const processHeader = (header) => {
            const view = new DataView(header);
            const getWord = (index) => String.fromCharCode(view.getUint8(index), view.getUint8(index + 1), view.getUint8(index + 2), view.getUint8(index + 3));
            // RIFF 4 bytes.
            if ("RIFF" !== getWord(0)) {
                headerResult.reject("Invalid WAV header in file, RIFF was not found");
                return;
            }
            // length, 4 bytes
            // RIFF Type & fmt 8 bytes
            if ("WAVE" !== getWord(8) || "fmt " !== getWord(12)) {
                headerResult.reject("Invalid WAV header in file, WAVEfmt was not found");
                return;
            }
            const formatSize = view.getInt32(16, true);
            const channelCount = view.getUint16(22, true);
            const sampleRate = view.getUint32(24, true);
            const bitsPerSample = view.getUint16(34, true);
            // Confirm if header is 44 bytes long.
            let pos = 36 + Math.max(formatSize - 16, 0);
            for (; getWord(pos) !== "data"; pos += 2) {
                if (pos > maxHeaderSize - 8) {
                    headerResult.reject("Invalid WAV header in file, data block was not found");
                    return;
                }
            }
            this.privHeaderEnd = pos + 8;
            headerResult.resolve(AudioStreamFormat.getWaveFormatPCM(sampleRate, bitsPerSample, channelCount));
        };
        if (typeof window !== "undefined" && typeof Blob !== "undefined" && header instanceof Blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const header = event.target.result;
                processHeader(header);
            };
            reader.readAsArrayBuffer(header);
        }
        else {
            const h = header;
            processHeader(h.buffer.slice(h.byteOffset, h.byteOffset + h.byteLength));
        }
        return headerResult.promise;
    }
    upload(audioNodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const onerror = (error) => {
                const errorMsg = `Error occurred while processing '${this.privFilename}'. ${error}`;
                this.onEvent(new AudioStreamNodeErrorEvent(this.privId, audioNodeId, errorMsg));
                throw new Error(errorMsg);
            };
            try {
                yield this.turnOn();
                const format = yield this.privAudioFormatPromise;
                const stream = new ChunkedArrayBufferStream(format.avgBytesPerSec / 10, audioNodeId);
                this.privStreams[audioNodeId] = stream;
                const chunk = this.privSource.slice(this.privHeaderEnd);
                const processFile = (buff) => {
                    if (stream.isClosed) {
                        return; // output stream was closed (somebody called TurnOff). We're done here.
                    }
                    stream.writeStreamChunk({
                        buffer: buff,
                        isEnd: false,
                        timeReceived: Date.now(),
                    });
                    stream.close();
                };
                if (typeof window !== "undefined" && typeof Blob !== "undefined" && chunk instanceof Blob) {
                    const reader = new FileReader();
                    reader.onerror = (ev) => onerror(ev.toString());
                    reader.onload = (event) => {
                        const fileBuffer = event.target.result;
                        processFile(fileBuffer);
                    };
                    reader.readAsArrayBuffer(chunk);
                }
                else {
                    const c = chunk;
                    processFile(c.buffer.slice(c.byteOffset, c.byteOffset + c.byteLength));
                }
                return stream;
            }
            catch (e) {
                onerror(e);
            }
        });
    }
    onEvent(event) {
        this.privEvents.onEvent(event);
        Events.instance.onEvent(event);
    }
}

//# sourceMappingURL=FileAudioSource.js.map
