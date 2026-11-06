export interface PreprocessResult {
    cleaned_jd_text: string;
    removed_sections: string[];
    removed_char_count: number;
    early_disqualification?: string;
}

export function preprocessJD(rawText: string): PreprocessResult {
    const rawLower = rawText.toLowerCase();

    // 1. Zero-Token Early Exits (V3 Hardening)
    const fatalKeywords = [
        'ts/sci',
        'security clearance required',
        '100% onsite',
        'must be onsite 5 days',
        'must relocate',
        'weekly travel'
    ];

    for (const kw of fatalKeywords) {
        if (rawLower.includes(kw)) {
            return {
                cleaned_jd_text: rawText,
                removed_sections: [],
                removed_char_count: 0,
                early_disqualification: `V3 Fatal Preprocessor Exit: '${kw}' detected`
            };
        }
    }

    // 2. Deterministic EEOC, Benefits, and Privacy stripping (Boilerplate)
    const removed_sections: string[] = [];
    let cleaned = rawText;

    const boilerplatePatterns = [
        /equal opportunity employer.*$/gims,
        /eeo.*$/gims,
        /benefits include.*$/gims,
        /401k matching.*$/gims,
        /vision and dental.*$/gims,
        /dental\/vision.*$/gims,
        /401k.*$/gims,
        /privacy policy.*$/gims,
        /benefits package.*$/gims
    ];

    for (const regex of boilerplatePatterns) {
        const matches = [...cleaned.matchAll(regex)];
        if (matches && matches.length > 0) {
            for (const match of matches) {
                removed_sections.push(match[0]);
                cleaned = cleaned.replace(match[0], '');
            }
        }
    }

    const removed_char_count = rawText.length - cleaned.length;

    return {
        cleaned_jd_text: cleaned.trim(),
        removed_sections,
        removed_char_count
    };
}
