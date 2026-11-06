import { AgentSukiPayload } from '@jhos/shared';
/**
 * Renders the candidate payload into an existing docx buffer template.
 * @param templateBuffer The binary buffer of the Template Resume (1).docx
 * @param payload The generated payload from Agent Suki
 * @returns A buffer of the generated PDF
 */
export declare function renderResume(templateBuffer: Buffer, payload: AgentSukiPayload): Buffer;
