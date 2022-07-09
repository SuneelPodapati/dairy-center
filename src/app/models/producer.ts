export interface IProducer {
    _id?: string;
    code: string;
    name: string;
    active: boolean;
    contactNumber: string;
    bankAccountNumber: string;
    bankIfscCode: string;

    loanDate?: string;
    loanAmount?: number;
    interestAmount?: number;
    otherAmount?: number;
    loan2Date?: string;
    loan2Amount?: number;
}

export class Producer implements IProducer {
    _id?: string;
    code: string = '';
    name: string = '';
    active: boolean = true;
    contactNumber: string = '';
    bankAccountNumber: string = '';
    bankIfscCode: string = '';

    loanDate: string = '';
    loanAmount: number = 0;
    interestAmount: number = 0;
    otherAmount: number = 0;
    loan2Date: string;
    loan2Amount: number;

    constructor(code: string) {
        this.code = code;
    }
}