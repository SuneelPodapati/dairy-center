import { Component, OnInit } from "@angular/core";
import { ProcurementService, ProducerService } from '../services';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { IProducersBill } from './producers-bill'
import { Router } from "@angular/router";
import { IProducer } from "../producers/producer";

@Component({
    selector: 'producers-bill',
    styleUrls: ['./producers-bill.component.css'],
    templateUrl: './producers-bill.component.html'
})
export class ProducersBillComponent implements OnInit {

    private hotRegisterer = new HotTableRegisterer();

    constructor(private procurementService: ProcurementService,
        private producerService: ProducerService,
        private router: Router) {
        let now = new Date();
        let today = now.getDate();
        let start = '', end = '';
        if (today <= 10) {
            start = '01';
            end = '10';
        }
        else if (today >= 11 && today <= 20) {
            start = '11';
            end = '20';
        }
        else {
            start = '21';
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() + '';
        }
        this.billStartDate = new Date(now.toISOString().substr(0, 8) + start);
        this.billEndDate = new Date(now.toISOString().substr(0, 8) + end);
    }

    ngOnInit(): void {
        this.producerService.getProducers().subscribe(producers => {
            if (producers.length > 0) {
                this.billData = producers.map(p => (
                    {
                        code: p.code,
                        name: p.name,
                        selected: true,
                        quantity: 0,
                        amount: 0,
                        producer: p,
                        procurements: []
                    }));
                this.updateData();
            }
            else {
                window.alert('Please add Producers first!!')
                this.router.navigate(['producers'])
            }
        });
    }

    title: string = 'PRODUCER MILK PAYMENT FROM ';
    mccCode: string = 'SSSMCC - 377';
    hotId = 'producers-bill';
    hot = () => this.hotRegisterer.getInstance(this.hotId)
    hotData = (data?: IProducersBill[]): IProducersBill[] => {
        if (data) {
            this.hot().loadData(data);
        }
        return this.hot().getSourceData() as IProducersBill[];
    }

    billStartDate: Date;
    billEndDate: Date;
    showTotal: boolean = false;
    billData: IProducersBill[] = [];
    selectedBillData: IProducersBill[] = [];

    hotSettings: Handsontable.GridSettings = {
        licenseKey: 'non-commercial-and-evaluation',
        columns: [
            { title: ' ', data: 'selected', type: 'checkbox' },//, className: 'hidden-print' },
            { title: 'Producer Code', data: 'code', readOnly: true },
            { title: 'Producer Name', data: 'name', readOnly: true, className: 'text-left' },
            { title: 'Quantity (Ltrs.)', data: 'quantity', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Amount', data: 'amount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Signature', readOnly: true, className: 'reference-cell' }
        ],
        colWidths: ['50', '150', '350', '150', '150', '200'],
        readOnlyCellClassName: 'not-dimmed',
        colHeaders: true,
        tableClassName: "center"// hide-print-table-first-column"
    }

    changeDate(event: Event, control: string): void {
        let date = event.target['valueAsDate'];
        if (date && date instanceof Date) {
            this[control] = date;
            this.updateData();
        }
    }

    updateData() {
        this.procurementService.getBillProcurements(this.billStartDate, this.billEndDate).subscribe(procurements => {
            this.billData = this.billData.map(p => (
                {
                    ...p,
                    quantity: procurements.filter(x => x.producerCode == p.code).reduce((s, c) => s + c.quantity, 0),
                    amount: Math.round(procurements.filter(x => x.producerCode == p.code).reduce((s, c) => s + c.totalAmount, 0)),
                    procurements: procurements.filter(x => x.producerCode == p.code)
                }));
            this.hot().loadData(this.billData);
            this.showTotal = false;
            this.selectedBillData = this.billData;
        });
    }

    changeShowTotal(event: Event): void {
        this.showTotal = event.target['checked'];
        if (this.showTotal) {
            let data = this.hotData();
            let total: IProducersBill = {
                code: '',
                name: 'Total',
                selected: false,
                quantity: this.billData.reduce((s, c) => s + c.quantity, 0),
                amount: this.billData.reduce((s, c) => s + c.amount, 0),
                producer: null,
                procurements: []
            };
            this.hotData([...data, total]);
        }
        else {
            this.hotData(this.hotData().slice(0, -1));
        }

    }

    getBill(): void {
        let data = this.hotData();
        //this.hot().updateSettings({ ...this.hotSettings, cells: this.notSelected });
        this.selectedBillData = data.filter(x => x.selected && x.producer != null);
    }

    notSelected = (row: number, col: number): any => {
        return col == 1 && !this.hotData()[row].selected ? { className: 'indian-red' } : {};
    }

    get saveButtonPositionX(): number {
        let ref = document.getElementsByClassName('reference-cell')[0];
        if (ref) {
            let position = ref.getBoundingClientRect();
            return position.x;
        }
        return 100;
    }


}