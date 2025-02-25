// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/**
 * Responsible for building the object to be sent to the speech service to support dynamic grammars.
 * @class DynamicGrammarBuilder
 */
export class DynamicGrammarBuilder {
    // Adds one more reference phrases to the dynamic grammar to send.
    // All added phrases are generic phrases.
    addPhrase(phrase) {
        if (!this.privPhrases) {
            this.privPhrases = [];
        }
        if (phrase instanceof Array) {
            this.privPhrases = this.privPhrases.concat(phrase);
        }
        else {
            this.privPhrases.push(phrase);
        }
    }
    // Clears all phrases stored in the current object.
    clearPhrases() {
        this.privPhrases = undefined;
    }
    // Adds one or more reference grammars to the current grammar.
    addReferenceGrammar(grammar) {
        if (!this.privGrammars) {
            this.privGrammars = [];
        }
        if (grammar instanceof Array) {
            this.privGrammars = this.privGrammars.concat(grammar);
        }
        else {
            this.privGrammars.push(grammar);
        }
    }
    // clears all grammars stored on the recognizer.
    clearGrammars() {
        this.privGrammars = undefined;
    }
    // Generates an object that represents the dynamic grammar used by the Speech Service.
    // This is done by building an object with the correct layout based on the phrases and reference grammars added to this instance
    // of a DynamicGrammarBuilder
    generateGrammarObject() {
        if (this.privGrammars === undefined && this.privPhrases === undefined) {
            return undefined;
        }
        const retObj = {};
        retObj.ReferenceGrammars = this.privGrammars;
        if (undefined !== this.privPhrases && 0 !== this.privPhrases.length) {
            const retPhrases = [];
            this.privPhrases.forEach((value) => {
                retPhrases.push({
                    Text: value,
                });
            });
            retObj.Groups = [{ Type: "Generic", Items: retPhrases }];
        }
        return retObj;
    }
}

//# sourceMappingURL=DynamicGrammarBuilder.js.map
