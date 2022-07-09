import { IProducer } from ".";

export interface IBillSummary {
    code: string;
    name: string;
    quantity: number;
    amount: number;
}