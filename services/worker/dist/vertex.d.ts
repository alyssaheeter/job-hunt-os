import { AgentSukiPayload } from '@jhos/shared';
import { EvaluatorResultSchemaType } from '@jhos/shared';
export declare function invokeJDNormalizer(rawText: string): Promise<any>;
export declare function invokeEvaluatorAgent(normalizedJobJson: string): Promise<EvaluatorResultSchemaType>;
/**
 * Invoke Agent Suki using optionally cached context for the Facts.
 */
export declare function invokeAgentSuki(jdText: string, factsData: any): Promise<{
    payload: AgentSukiPayload;
    tokens: any;
}>;
