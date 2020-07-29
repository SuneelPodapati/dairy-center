export interface IProducer {
    _id?: string;
    code: string;
    name: string;
    active: boolean;
    contactNumber: string;
    bankAccountNumber: string;
    bankIfscCode: string;
}

export class Producer implements IProducer {
    _id?: string;
    code: string = '';
    name: string = '';
    active: boolean = true;
    contactNumber: string = '';
    bankAccountNumber: string = '';
    bankIfscCode: string = '';

    constructor(code: string) {
        this.code = code;
    }
}