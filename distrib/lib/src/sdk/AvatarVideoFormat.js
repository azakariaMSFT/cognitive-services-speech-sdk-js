// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable max-classes-per-file */
/**
 * Defines a coordinate in 2D space.
 * @class Coordinate
 * Added in version 1.33.0
 */
export class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
/**
 * Defines the avatar output video format.
 * @class AvatarVideoFormat
 * Added in version 1.33.0
 *
 * @experimental This feature is experimental and might change in the future.
 */
export class AvatarVideoFormat {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {string} codec - The video codec.
     * @param {number} bitrate - The video bitrate.
     * @param {number} width - The video width.
     * @param {number} height - The video height.
     */
    constructor(codec = "H264", bitrate = 2000000, width = 1920, height = 1080) {
        this.codec = codec;
        this.bitrate = bitrate;
        this.width = width;
        this.height = height;
    }
    /**
     * Sets the video crop range.
     */
    setCropRange(topLeft, bottomRight) {
        this.cropRange = {
            bottomRight,
            topLeft,
        };
    }
}

//# sourceMappingURL=AvatarVideoFormat.js.map
