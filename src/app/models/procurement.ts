export interface IProcurement {
    _id?: string;
    producerCode: string;
    date: Date;
    shift: string;
    quantity: number;
    fat: number;
    kgFat: number;
    rate: number;
    premiumRate: number;
    grossAmount: number;
    incentiveRate: number;
    incentiveAmount: number;
    totalAmount: number;
    sampleNumber: string;
    adjustRate: boolean;
}

export class Procurement implements IProcurement {
    _id?: string;
    producerCode: string;
    date: Date = new Date();
    shift: string = 'AM'
    quantity: number = 0;
    fat: number = 0;
    kgFat: number = 0;
    rate: number = 0;
    premiumRate: number = 0;
    grossAmount: number = 0;
    incentiveRate: number = 0;
    incentiveAmount: number = 0;
    totalAmount: number = 0;
    sampleNumber: string;
    adjustRate: boolean = false;

    constructor(date?: Date, shift?: string, rate?: number, incentiveRate?: number, premiumRate?: number, producerCode?: string, sampleNumber?: string) {
        if (date) {
            this.date = date;
        }
        if (shift) {
            this.shift = shift;
        }
        if (rate) {
            this.rate = rate;
        }
        if (incentiveRate) {
            this.incentiveRate = incentiveRate;
        }
        if (premiumRate) {
            this.premiumRate = premiumRate;
        }
        if (+producerCode > 0) {
            this.producerCode = producerCode;
        }
        if (sampleNumber) {
            this.sampleNumber = sampleNumber;
        }
    }

}