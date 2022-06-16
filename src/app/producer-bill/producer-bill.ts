import { IProducer } from "../producers";
import { IProcurement } from "../procurement";

export interface IProducerBill { 
    producer: IProducer;
    procurements: IProcurement[];
}