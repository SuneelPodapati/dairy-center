import { IProducer } from ".";
import { IProcurement } from ".";

export interface IProducerProcurements {
    producer: IProducer;
    procurements: IProcurement[];
}