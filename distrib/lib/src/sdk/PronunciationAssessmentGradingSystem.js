// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/**
 * Defines the point system for pronunciation score calibration; default value is FivePoint.
 * Added in version 1.15.0
 * @class PronunciationAssessmentGradingSystem
 */
export var PronunciationAssessmentGradingSystem;
(function (PronunciationAssessmentGradingSystem) {
    /**
     * Five point calibration
     * @member PronunciationAssessmentGradingSystem.FivePoint
     */
    PronunciationAssessmentGradingSystem[PronunciationAssessmentGradingSystem["FivePoint"] = 1] = "FivePoint";
    /**
     * Hundred mark
     * @member PronunciationAssessmentGradingSystem.HundredMark
     */
    PronunciationAssessmentGradingSystem[PronunciationAssessmentGradingSystem["HundredMark"] = 2] = "HundredMark";
})(PronunciationAssessmentGradingSystem || (PronunciationAssessmentGradingSystem = {}));

//# sourceMappingURL=PronunciationAssessmentGradingSystem.js.map
