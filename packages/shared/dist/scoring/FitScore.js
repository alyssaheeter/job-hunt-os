const RUBRIC_WEIGHTS = {
    salesEngineerFit: 30,
    compensation: 20,
    technicalDepth: 15,
    dealComplexity: 10,
    remote: 10,
    revenueScope: 10,
    industry: 5
};
/**
 * Calculates the overall FitScore.
 * Inputs to this function should be normalized between 0.0 and 1.0
 * based on the Vertex AI extraction outputs.
 */
export function calculateFitScore(rubricScores) {
    let totalScore = 0;
    totalScore += rubricScores.salesEngineerFit * RUBRIC_WEIGHTS.salesEngineerFit;
    totalScore += rubricScores.compensation * RUBRIC_WEIGHTS.compensation;
    totalScore += rubricScores.technicalDepth * RUBRIC_WEIGHTS.technicalDepth;
    totalScore += rubricScores.dealComplexity * RUBRIC_WEIGHTS.dealComplexity;
    totalScore += rubricScores.remote * RUBRIC_WEIGHTS.remote;
    totalScore += rubricScores.revenueScope * RUBRIC_WEIGHTS.revenueScope;
    totalScore += rubricScores.industry * RUBRIC_WEIGHTS.industry;
    // Math.round to make it an integer for strict threshold comparison
    return Math.round(totalScore);
}
export function calculateSubtractiveFitScore(deductions) {
    const totalDeductions = deductions.reduce((acc, current) => acc + current.points_deducted, 0);
    return Math.max(0, 100 - totalDeductions);
}
export function isQualified(fitScore) {
    return fitScore >= 80;
}
export function checkDisqualifiers(job) {
    const reasons = [];
    if (job.risk_flags.pure_ae)
        reasons.push("Pure AE role");
    if (job.risk_flags.internal_it_support)
        reasons.push("Internal IT Support role");
    if (job.risk_flags.demo_monkey_risk)
        reasons.push("Demo-only role");
    // V2 Travel Hardening Logic
    const regionalTravel = job.location.travel_profile?.regional_max || 0;
    const globalTravel = job.location.travel_profile?.global_max || 0;
    if (regionalTravel > 40)
        reasons.push("Regional travel exceeds 40%");
    if (globalTravel > 10)
        reasons.push("Global travel exceeds 10%");
    // Work mode disqualifiers
    if (job.location.work_mode === 'onsite' && job.location.onsite_days >= 5)
        reasons.push("5-day mandatory onsite");
    // Compensation Logic (V2): Don't drop if base is missing.
    // Base is missing and explicitly tracked, recruiter question covers it. Only drop if explicit base < 150k
    if (job.risk_flags.comp_below_floor || (job.compensation.base_max && job.compensation.base_max < 150000)) {
        reasons.push("Explicit base compensation below floor ($150k)");
    }
    return { disqualified: reasons.length > 0, reasons };
}
/**
 * Search Intensity Engine MVP Formula
 * Effort = targeted apps + outbound sends + followups + proof pack shipped
 * Conversion = interviews / meaningful conversations
 * Target Value = average pursued FitScore weighted by comp confidence
 * Intensity = normalize(Effort) * normalize(Conversion) * normalize(Target Value)
 */
export function calculateSearchIntensity(metrics) {
    const effort = metrics.applications + metrics.outbounds + metrics.followups + metrics.proofPacks;
    const conversion = metrics.meaningfulConversations > 0 ? metrics.interviews / metrics.meaningfulConversations : 0;
    const targetValue = metrics.avgFitScore * metrics.compConfidenceWeight;
    // Normalization factors (configurable for MVP tuning)
    const normEffort = Math.min(effort / 20, 1.0); // Assuming 20 actions is a strong week
    const normConv = Math.min(conversion / 0.2, 1.0); // Assuming 20% conversion is target
    const normTarget = Math.min(targetValue / 100, 1.0);
    const intensity = (normEffort * normConv * normTarget) * 10; // Scale 1-10
    return Math.round(intensity * 10) / 10;
}
//# sourceMappingURL=FitScore.js.map