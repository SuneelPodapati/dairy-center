import { IProcurement } from "../procurement";
import { IProducer } from "../producers/producer";

export interface IProducersBill {
    code: string;
    name: string;
    quantity: number;
    amount: number;
    producer: IProducer;
    procurements: IProcurement[];
}