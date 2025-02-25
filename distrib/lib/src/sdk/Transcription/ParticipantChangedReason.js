// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// Multi-device Conversation is a Preview feature.
export var ParticipantChangedReason;
(function (ParticipantChangedReason) {
    /** Participant has joined the conversation. */
    ParticipantChangedReason[ParticipantChangedReason["JoinedConversation"] = 0] = "JoinedConversation";
    /** Participant has left the conversation. This could be voluntary, or involuntary
     * (e.g. they are experiencing networking issues).
     */
    ParticipantChangedReason[ParticipantChangedReason["LeftConversation"] = 1] = "LeftConversation";
    /** The participants' state has changed (e.g. they became muted, changed their nickname). */
    ParticipantChangedReason[ParticipantChangedReason["Updated"] = 2] = "Updated";
})(ParticipantChangedReason || (ParticipantChangedReason = {}));

//# sourceMappingURL=ParticipantChangedReason.js.map
