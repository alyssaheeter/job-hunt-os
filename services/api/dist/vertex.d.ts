export interface CommsSequence {
    day0: {
        subject: string;
        body: string;
    };
    day3: {
        subject: string;
        body: string;
    };
    day7: {
        subject: string;
        body: string;
    };
    day14: {
        subject: string;
        body: string;
    };
}
export declare function invokeCommsAgent(jobContext: any, proofPackRecommended: string): Promise<CommsSequence>;
