import { Component, OnInit } from "@angular/core";
import { ProcurementService, ProducerService } from '../services';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { IProducer } from "../producers";
import { IProcurement, Procurement } from '../procurement'
import { Router } from "@angular/router";

@Component({
    selector: 'producer-bill',
    styleUrls: ['./producer-bill.component.css'],
    templateUrl: './producer-bill.component.html'
})
export class ProducerBillComponent implements OnInit {

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
        this.producerService.getProducers().subscribe(resp => {
            this.producers = resp;
            if (this.producers.length > 0) {
                this.selectedProducer = this.producers[0];
                this.updateData();
            }
            else {
                window.alert('Please add Producers first!!')
                this.router.navigate(['producers'])
            }
        })
    }

    title: string = 'MILK BILL FROM ';
    hotId = 'producer-bill';
    hot = () => this.hotRegisterer.getInstance(this.hotId)
    hotData = (data?: IProcurement[]): IProcurement[] => {
        if (data) {
            this.hot().loadData(data);
        }
        return this.hot().getSourceData() as IProcurement[];
    }
    dateRenderer = (hotInstance, TD, row, col, prop, value, cellProperties) => {
        let date = null;
        if (value instanceof Date) {
            date = value as Date;
        }
        else if (value == null) {
            TD.innerHTML = '';
            return;
        }
        else if ((new Date(value)).toString() != 'Invalid Date') {
            date = new Date(value);
        }
        TD.innerHTML = date.toLocaleDateString();
    }
    billStartDate: Date;
    billEndDate: Date;
    producers: IProducer[] = [];
    selectedProducer: IProducer = this.producers[0];
    selectedProducerProcurements: IProcurement[] = [];
    showTotal: boolean = true;

    hotSettings: Handsontable.GridSettings = {
        licenseKey: 'non-commercial-and-evaluation',
        columns: [
            { title: 'Date', data: 'date', readOnly: true, renderer: this.dateRenderer },
            { title: 'Shift', data: 'shift', readOnly: true },
            { title: 'Quantity (Ltrs.)', data: 'quantity', type: 'numeric', readOnly: true, numericFormat: { pattern: '0,0.00' } },
            { title: 'Fat', data: 'fat', type: 'numeric', readOnly: true, numericFormat: { pattern: '0,0.0' } },
            { title: 'Kg Fat', data: 'kgFat', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.000' } },
            { title: 'Gross Amount', data: 'grossAmount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Incentive', data: 'incentiveAmount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Total Amount', data: 'totalAmount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
        ],
        colWidths: ['150', '50', '150', '100', '100', '150', '150', '150'],
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

    changeProducer(event: Event) {
        let selectedProducerCode = event.target['value'];
        this.selectedProducer = this.producers.find(x => x.code == selectedProducerCode);
        this.updateData();
    }

    updateData() {
        this.procurementService.getBillProcurements(this.billStartDate, this.billEndDate, this.selectedProducer?.code).subscribe(procurements => {
            this.selectedProducerProcurements = procurements
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() == 0 ? (a.shift > b.shift ? 1 : -1) : 1);
            this.showTotal ? this.showWithTotal() : this.hotData(this.selectedProducerProcurements);
        });
    }

    changeShowTotal(event: Event): void {
        this.showTotal = event.target['checked'];
        if (this.showTotal) {
            this.showWithTotal();
        }
        else {
            this.hotData(this.hotData().slice(0, -1));
        }
    }

    showWithTotal() {
        let total: IProcurement = {
            ...(new Procurement),
            shift: 'Total',
            date: null,
            quantity: this.totalQuantity,
            kgFat: this.totalKgFat,
            fat: 0,
            grossAmount: this.totalGrossAmount,
            incentiveAmount: this.totalIncentiveAmount,
            totalAmount: this.totalAmount
        };
        total.fat = this.totalFat;
        this.hotData([...this.selectedProducerProcurements, total]);
    }

    get totalQuantity(): number {
        return this.selectedProducerProcurements.reduce((s, p) => s + p.quantity, 0);
    }
    get totalFat(): number {
        return this.totalQuantity != 0 ? (this.totalKgFat / this.totalQuantity * 100) : 0;
    }
    get totalKgFat(): number {
        return this.selectedProducerProcurements.reduce((s, p) => s + p.kgFat, 0);
    }
    get totalGrossAmount(): number {
        return this.selectedProducerProcurements.reduce((s, p) => s + p.grossAmount, 0);
    }
    get totalIncentiveAmount(): number {
        return this.selectedProducerProcurements.reduce((s, p) => s + p.incentiveAmount, 0);
    }
    get totalAmount(): number {
        return this.selectedProducerProcurements.reduce((s, p) => s + p.totalAmount, 0);
    }
    get rate(): string {
        return this.totalQuantity != 0 ? (this.totalGrossAmount / this.totalQuantity).toFixed(2) : "";
    }
    get incentiveRate(): string {
        return this.totalQuantity != 0 ? (this.totalIncentiveAmount / this.totalQuantity).toFixed(2) : "";
    }
    get totalRate(): string {
        return this.totalQuantity != 0 ? (this.totalAmount / this.totalQuantity).toFixed(2) : "";
    }

}