// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { FileAudioSource, MicAudioSource, PcmRecorder, } from "../../common.browser/Exports.js";
import { Contracts } from "../Contracts.js";
import { AudioInputStream, PullAudioInputStreamCallback, PullAudioOutputStream, PushAudioOutputStream, PushAudioOutputStreamCallback, SpeakerAudioDestination } from "../Exports.js";
import { AudioFileWriter } from "./AudioFileWriter.js";
import { PullAudioInputStreamImpl } from "./AudioInputStream.js";
import { PushAudioOutputStreamImpl } from "./AudioOutputStream.js";
/**
 * Represents audio input configuration used for specifying what type of input to use (microphone, file, stream).
 * @class AudioConfig
 * Updated in version 1.11.0
 */
export class AudioConfig {
    /**
     * Creates an AudioConfig object representing the default microphone on the system.
     * @member AudioConfig.fromDefaultMicrophoneInput
     * @function
     * @public
     * @returns {AudioConfig} The audio input configuration being created.
     */
    static fromDefaultMicrophoneInput() {
        const pcmRecorder = new PcmRecorder(true);
        return new AudioConfigImpl(new MicAudioSource(pcmRecorder));
    }
    /**
     * Creates an AudioConfig object representing a microphone with the specified device ID.
     * @member AudioConfig.fromMicrophoneInput
     * @function
     * @public
     * @param {string | undefined} deviceId - Specifies the device ID of the microphone to be used.
     * Default microphone is used the value is omitted.
     * @returns {AudioConfig} The audio input configuration being created.
     */
    static fromMicrophoneInput(deviceId) {
        const pcmRecorder = new PcmRecorder(true);
        return new AudioConfigImpl(new MicAudioSource(pcmRecorder, deviceId));
    }
    /**
     * Creates an AudioConfig object representing the specified file.
     * @member AudioConfig.fromWavFileInput
     * @function
     * @public
     * @param {File} fileName - Specifies the audio input file. Currently, only WAV / PCM is supported.
     * @returns {AudioConfig} The audio input configuration being created.
     */
    static fromWavFileInput(file, name = "unnamedBuffer.wav") {
        return new AudioConfigImpl(new FileAudioSource(file, name));
    }
    /**
     * Creates an AudioConfig object representing the specified stream.
     * @member AudioConfig.fromStreamInput
     * @function
     * @public
     * @param {AudioInputStream | PullAudioInputStreamCallback | MediaStream} audioStream - Specifies the custom audio input
     * stream. Currently, only WAV / PCM is supported.
     * @returns {AudioConfig} The audio input configuration being created.
     */
    static fromStreamInput(audioStream) {
        if (audioStream instanceof PullAudioInputStreamCallback) {
            return new AudioConfigImpl(new PullAudioInputStreamImpl(audioStream));
        }
        if (audioStream instanceof AudioInputStream) {
            return new AudioConfigImpl(audioStream);
        }
        if (typeof MediaStream !== "undefined" && audioStream instanceof MediaStream) {
            const pcmRecorder = new PcmRecorder(false);
            return new AudioConfigImpl(new MicAudioSource(pcmRecorder, null, null, audioStream));
        }
        throw new Error("Not Supported Type");
    }
    /**
     * Creates an AudioConfig object representing the default speaker.
     * @member AudioConfig.fromDefaultSpeakerOutput
     * @function
     * @public
     * @returns {AudioConfig} The audio output configuration being created.
     * Added in version 1.11.0
     */
    static fromDefaultSpeakerOutput() {
        return new AudioOutputConfigImpl(new SpeakerAudioDestination());
    }
    /**
     * Creates an AudioConfig object representing the custom IPlayer object.
     * You can use the IPlayer object to control pause, resume, etc.
     * @member AudioConfig.fromSpeakerOutput
     * @function
     * @public
     * @param {IPlayer} player - the IPlayer object for playback.
     * @returns {AudioConfig} The audio output configuration being created.
     * Added in version 1.12.0
     */
    static fromSpeakerOutput(player) {
        if (player === undefined) {
            return AudioConfig.fromDefaultSpeakerOutput();
        }
        if (player instanceof SpeakerAudioDestination) {
            return new AudioOutputConfigImpl(player);
        }
        throw new Error("Not Supported Type");
    }
    /**
     * Creates an AudioConfig object representing a specified output audio file
     * @member AudioConfig.fromAudioFileOutput
     * @function
     * @public
     * @param {PathLike} filename - the filename of the output audio file
     * @returns {AudioConfig} The audio output configuration being created.
     * Added in version 1.11.0
     */
    static fromAudioFileOutput(filename) {
        return new AudioOutputConfigImpl(new AudioFileWriter(filename));
    }
    /**
     * Creates an AudioConfig object representing a specified audio output stream
     * @member AudioConfig.fromStreamOutput
     * @function
     * @public
     * @param {AudioOutputStream | PushAudioOutputStreamCallback} audioStream - Specifies the custom audio output
     * stream.
     * @returns {AudioConfig} The audio output configuration being created.
     * Added in version 1.11.0
     */
    static fromStreamOutput(audioStream) {
        if (audioStream instanceof PushAudioOutputStreamCallback) {
            return new AudioOutputConfigImpl(new PushAudioOutputStreamImpl(audioStream));
        }
        if (audioStream instanceof PushAudioOutputStream) {
            return new AudioOutputConfigImpl(audioStream);
        }
        if (audioStream instanceof PullAudioOutputStream) {
            return new AudioOutputConfigImpl(audioStream);
        }
        throw new Error("Not Supported Type");
    }
}
/**
 * Represents audio input stream used for custom audio input configurations.
 * @private
 * @class AudioConfigImpl
 */
export class AudioConfigImpl extends AudioConfig {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {IAudioSource} source - An audio source.
     */
    constructor(source) {
        super();
        this.privSource = source;
    }
    /**
     * Format information for the audio
     */
    get format() {
        return this.privSource.format;
    }
    /**
     * @member AudioConfigImpl.prototype.close
     * @function
     * @public
     */
    close(cb, err) {
        this.privSource.turnOff().then(() => {
            if (!!cb) {
                cb();
            }
        }, (error) => {
            if (!!err) {
                err(error);
            }
        });
    }
    /**
     * @member AudioConfigImpl.prototype.id
     * @function
     * @public
     */
    id() {
        return this.privSource.id();
    }
    /**
     * @member AudioConfigImpl.prototype.turnOn
     * @function
     * @public
     * @returns {Promise<void>} A promise.
     */
    turnOn() {
        return this.privSource.turnOn();
    }
    /**
     * @member AudioConfigImpl.prototype.attach
     * @function
     * @public
     * @param {string} audioNodeId - The audio node id.
     * @returns {Promise<IAudioStreamNode>} A promise.
     */
    attach(audioNodeId) {
        return this.privSource.attach(audioNodeId);
    }
    /**
     * @member AudioConfigImpl.prototype.detach
     * @function
     * @public
     * @param {string} audioNodeId - The audio node id.
     */
    detach(audioNodeId) {
        return this.privSource.detach(audioNodeId);
    }
    /**
     * @member AudioConfigImpl.prototype.turnOff
     * @function
     * @public
     * @returns {Promise<void>} A promise.
     */
    turnOff() {
        return this.privSource.turnOff();
    }
    /**
     * @member AudioConfigImpl.prototype.events
     * @function
     * @public
     * @returns {EventSource<AudioSourceEvent>} An event source for audio events.
     */
    get events() {
        return this.privSource.events;
    }
    setProperty(name, value) {
        Contracts.throwIfNull(value, "value");
        if (undefined !== this.privSource.setProperty) {
            this.privSource.setProperty(name, value);
        }
        else {
            throw new Error("This AudioConfig instance does not support setting properties.");
        }
    }
    getProperty(name, def) {
        if (undefined !== this.privSource.getProperty) {
            return this.privSource.getProperty(name, def);
        }
        else {
            throw new Error("This AudioConfig instance does not support getting properties.");
        }
        return def;
    }
    get deviceInfo() {
        return this.privSource.deviceInfo;
    }
}
export class AudioOutputConfigImpl extends AudioConfig {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {IAudioDestination} destination - An audio destination.
     */
    constructor(destination) {
        super();
        this.privDestination = destination;
    }
    set format(format) {
        this.privDestination.format = format;
    }
    write(buffer) {
        this.privDestination.write(buffer);
    }
    close() {
        this.privDestination.close();
    }
    id() {
        return this.privDestination.id();
    }
    setProperty() {
        throw new Error("This AudioConfig instance does not support setting properties.");
    }
    getProperty() {
        throw new Error("This AudioConfig instance does not support getting properties.");
    }
}

//# sourceMappingURL=AudioConfig.js.map
