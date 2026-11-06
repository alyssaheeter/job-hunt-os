import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
/**
 * Format a FactEntry array into a block of exactly 5 bullet points.
 * Missing fields will output "[FILL-IN]" as per failure mode rules.
 */
function unpackBullets(prefix, bullets) {
    const result = {};
    for (let i = 1; i <= 5; i++) {
        const key = `${prefix}_${i}`;
        let val = '[FILL-IN]';
        if (bullets && i <= bullets.length) {
            const b = bullets[i - 1];
            const outcome = b.outcome_metric || '[FILL-IN]';
            const mech = b.mechanism || '[FILL-IN]';
            const scope = b.scope || '[FILL-IN]';
            const tools = b.tooling || '[FILL-IN]';
            val = `${outcome} by ${mech} for ${scope} using ${tools}.`;
        }
        result[key] = val;
    }
    return result;
}
/**
 * Renders the candidate payload into an existing docx buffer template.
 * @param templateBuffer The binary buffer of the Template Resume (1).docx
 * @param payload The generated payload from Agent Suki
 * @returns A buffer of the generated PDF
 */
export function renderResume(templateBuffer, payload) {
    const zip = new PizZip(templateBuffer);
    // Create docxtemplater instance, using exact match line breaks
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter() {
            // By default replace missing fields with "[FILL-IN]"
            return "[FILL-IN]";
        }
    });
    const data = {
        PRO_SUMMARY: payload.summary || '[FILL-IN]',
        ...unpackBullets('INDEPENDENT_CONSULTANCY_BULLET', payload.independent_consultancy_bullets),
        ...unpackBullets('AHEAD_BULLET', payload.ahead_bullets),
        ...unpackBullets('ATT_CSE_BULLET', payload.att_cse_bullets),
        ...unpackBullets('ATT_B2B_BULLET', payload.att_b2b_bullets),
        SKILLS: payload.skills && payload.skills.length > 0 ? payload.skills.join('\n') : '[FILL-IN]'
    };
    doc.render(data);
    const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    });
    return buf;
}
//# sourceMappingURL=index.js.map