// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { InvalidOperationError } from "../common/Error.js";
import { DialogServiceTurnState } from "./DialogServiceTurnState.js";
export class DialogServiceTurnStateManager {
    constructor() {
        this.privTurnMap = new Map();
        return;
    }
    StartTurn(id) {
        if (this.privTurnMap.has(id)) {
            throw new InvalidOperationError("Service error: There is already a turn with id:" + id);
        }
        const turnState = new DialogServiceTurnState(this, id);
        this.privTurnMap.set(id, turnState);
        return this.privTurnMap.get(id);
    }
    GetTurn(id) {
        return this.privTurnMap.get(id);
    }
    CompleteTurn(id) {
        if (!this.privTurnMap.has(id)) {
            throw new InvalidOperationError("Service error: Received turn end for an unknown turn id:" + id);
        }
        const turnState = this.privTurnMap.get(id);
        turnState.complete();
        this.privTurnMap.delete(id);
        return turnState;
    }
}

//# sourceMappingURL=DialogServiceTurnStateManager.js.map
