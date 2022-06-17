import { Component, OnInit } from "@angular/core";
import { ProcurementService, ProducerService } from '../services';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { IProducersBill } from './producers-bill'
import { Router } from "@angular/router";

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
        this.updateData();
    }

    title: string = 'PRODUCER MILK PAYMENT FROM ';
    mcc: string = 'MILK COLLECTION CENTER, PURETIPALLI';
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

    hotSettings: Handsontable.GridSettings = {
        licenseKey: 'non-commercial-and-evaluation',
        columns: [
            { title: 'Producer Code', data: 'code', readOnly: true },
            { title: 'Producer Name', data: 'name', readOnly: true, className: 'text-left' },
            { title: 'Quantity (Ltrs.)', data: 'quantity', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Amount', data: 'amount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Signature', readOnly: true }
        ],
        colWidths: ['150', '350', '150', '150', '200'],
        readOnlyCellClassName: 'not-dimmed',
        colHeaders: true,
        tableClassName: "center"
    }

    changeDate(event: Event, control: string): void {
        let date = event.target['valueAsDate'];
        if (date && date instanceof Date) {
            this[control] = date;
            this.updateData();
        }
    }

    updateData() {
        this.producerService.getProducers().subscribe(producers => {
            if (producers.length > 0) {
                this.procurementService.getBillProcurements(this.billStartDate, this.billEndDate).subscribe(procurements => {
                    this.billData = producers.map(p => (
                        {
                            code: p.code,
                            name: p.name,
                            quantity: procurements.filter(x => x.producerCode == p.code).reduce((s, c) => s + c.quantity, 0),
                            amount: Math.round(procurements.filter(x => x.producerCode == p.code).reduce((s, c) => s + c.totalAmount, 0)),
                        }));
                    this.hot().loadData(this.billData);
                    this.showTotal = false;
                });
            }
            else {
                window.alert('Please add Producers first!!')
                this.router.navigate(['producers'])
            }
        })
    }

    changeShowTotal(event: Event): void {
        this.showTotal = event.target['checked'];
        if (this.showTotal) {
            let data = this.hotData();
            let total: IProducersBill = {
                code: '',
                name: 'Total',
                quantity: this.billData.reduce((s, c) => s + c.quantity, 0),
                amount: this.billData.reduce((s, c) => s + c.amount, 0),
            };
            this.hotData([...data, total]);
        }
        else {
            this.hotData(this.hotData().slice(0, -1));
        }

    }
}