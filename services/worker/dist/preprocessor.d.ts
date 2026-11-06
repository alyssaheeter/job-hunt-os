export interface PreprocessResult {
    cleaned_jd_text: string;
    removed_sections: string[];
    removed_char_count: number;
    early_disqualification?: string;
}
export declare function preprocessJD(rawText: string): PreprocessResult;
