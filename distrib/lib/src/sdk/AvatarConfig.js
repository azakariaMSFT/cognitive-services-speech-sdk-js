// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { Contracts } from "./Contracts.js";
import { AvatarVideoFormat } from "./Exports.js";
/**
 * Defines the talking avatar configuration.
 * @class AvatarConfig
 * Added in version 1.33.0
 *
 * @experimental This feature is experimental and might change or have limited support.
 */
export class AvatarConfig {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {string} character - The avatar character.
     * @param {string} style - The avatar style.
     * @param {AvatarVideoFormat} videoFormat - The talking avatar output video format.
     */
    constructor(character, style, videoFormat) {
        this.privCustomized = false;
        Contracts.throwIfNullOrWhitespace(character, "character");
        this.character = character;
        this.style = style;
        if (videoFormat === undefined) {
            videoFormat = new AvatarVideoFormat();
        }
        this.videoFormat = videoFormat;
    }
    /**
     * Indicates if the talking avatar is customized.
     */
    get customized() {
        return this.privCustomized;
    }
    /**
     * Sets if the talking avatar is customized.
     */
    set customized(value) {
        this.privCustomized = value;
    }
    /**
     * Sets the background color.
     */
    get backgroundColor() {
        return this.privBackgroundColor;
    }
    /**
     * Gets the background color.
     */
    set backgroundColor(value) {
        this.privBackgroundColor = value;
    }
}

//# sourceMappingURL=AvatarConfig.js.map
