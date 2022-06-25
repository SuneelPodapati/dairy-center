import { Component, OnInit, Input } from "@angular/core";
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
    @Input('producer-code') producerCode: string;
    @Input('producer') producer: IProducer;
    @Input('procurements') procurements: IProcurement[];
    @Input('start-date') startDate: string;
    @Input('end-date') endDate: string;
    @Input('hot-id') hotId: string = 'producer-bill';

    constructor(private procurementService: ProcurementService,
        private producerService: ProducerService,
        private router: Router) { }

    ngOnInit(): void {
        this.initializeDates();
        if (this.producer && this.producer.code) {
            this.producers.push(this.producer);
            this.selectedProducer = this.producer;
            this.disableChanges = true;
            if (this.procurements && this.procurements.length >= 0) {
                this.selectedProducerProcurements = this.procurements;
                setTimeout(() => {
                    this.showTotal ? this.showWithTotal() : this.hotData(this.selectedProducerProcurements);
                    this.loansHotSettings = { ...this.loansHotSettings, readOnly: this.disableChanges };
                    this.loansHotData(this.loanData);
                }, 1000);
            }
            else {
                this.updateData();
            }
        }
        else {
            this.producerService.getProducers().subscribe(resp => {
                this.producers = resp;
                if (this.producers.length > 0) {
                    this.selectedProducer = this.producerCode && this.producers.map(x => x.code).includes(this.producerCode)
                        ? this.producers.find(x => x.code == this.producerCode) : this.producers[0];
                    this.updateData();
                }
                else {
                    window.alert('Please add Producers first!!')
                    this.router.navigate(['producers'])
                }
            })
        }
    }

    title: string = 'MILK BILL FROM ';
    billStartDate: Date;
    billEndDate: Date;
    producers: IProducer[] = [];
    selectedProducer: IProducer;
    selectedProducerProcurements: IProcurement[] = [];
    showTotal: boolean = true;
    disableChanges: boolean = false;


    hot = () => this.hotRegisterer.getInstance(this.hotId)
    hotData = (data?: IProcurement[]): IProcurement[] => {
        if (data) {
            this.hot().loadData(data);
            this.hot().updateSettings({ ...this.hotSettings, mergeCells: this.mergeCells });
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
        TD.className = 'htMiddle';
    }
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
        tableClassName: "center",
        mergeCells: this.mergeCells
    }

    loanDataChanged = (changes, source): void => {
        if (source == 'edit') {
            changes = changes || [];
            changes.forEach(([row, col, oldValue, newValue]) => {
                if (row == 1 && col == 2 && (newValue === 0 || newValue > 0)) this.selectedProducer.loanAmount = newValue
                else if (row == 3 && col == 2 && (newValue === 0 || newValue > 0)) this.selectedProducer.interestAmount = newValue
                else if (row == 3 && col == 5 && (newValue === 0 || newValue > 0)) this.selectedProducer.recoveriesAmount = newValue
                else if (row == 4 && col == 2 && (newValue === 0 || newValue > 0)) this.selectedProducer.otherAmount = newValue
                else if (row == 1 && col == 0) this.selectedProducer.loanDate = newValue
                else if (row == 1 && col == 3 && (newValue === 0 || newValue > 0)) this.selectedProducer.loan2Amount = newValue
                else if (row == 1 && col == 4) this.selectedProducer.loan2Date = newValue
            });
            this.loansHotData(this.loanData);
        }
    }
    loansHot = () => this.hotRegisterer.getInstance(this.loansHotId)
    loansHotSettings: Handsontable.GridSettings = {
        licenseKey: 'non-commercial-and-evaluation',
        readOnlyCellClassName: 'not-dimmed',
        tableClassName: "center",
        afterChange: this.loanDataChanged,
        colWidths: ['200', '150', '150', '150', '200', '150'],
        cell: [
            { row: 0, col: 0, readOnly: true, className: 'highlight htRight' },
            { row: 0, col: 2, readOnly: true, className: 'highlight htRight' },
            { row: 0, col: 4, readOnly: true, className: 'highlight htRight' },
            { row: 1, col: 1, readOnly: true, className: 'highlight htRight' },
            { row: 2, col: 0, readOnly: true, className: 'highlight htRight' },
            { row: 2, col: 3, readOnly: true, className: 'highlight htRight' },
            { row: 3, col: 0, readOnly: true, className: 'highlight htRight' },
            { row: 3, col: 3, readOnly: true, className: 'highlight htRight' },
            { row: 4, col: 0, readOnly: true, className: 'highlight htRight' },
            { row: 4, col: 3, readOnly: true, className: 'highlight htRight' },
            { row: 5, col: 0, readOnly: true, className: 'highlight htRight' },
            { row: 6, col: 0, readOnly: true, className: 'highlight htRight' },
            { row: 7, col: 0, readOnly: true, className: 'highlight htRight' },

            { row: 0, col: 1, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 0, col: 3, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 0, col: 5, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 2, col: 2, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 2, col: 5, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 4, col: 5, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 5, col: 2, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 6, col: 5, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { row: 7, col: 2, readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },

            { row: 1, col: 5, readOnly: true },
            { row: 5, col: 3, readOnly: true },
            { row: 7, col: 3, readOnly: true, className: 'reference-cell' },

            { row: 1, col: 2, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'editable' },
            { row: 3, col: 2, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'editable' },
            { row: 3, col: 5, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'editable' },
            { row: 4, col: 2, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'editable' },
        ],
        mergeCells: [
            { row: 2, col: 0, rowspan: 1, colspan: 2 },
            { row: 2, col: 3, rowspan: 1, colspan: 2 },
            { row: 3, col: 0, rowspan: 1, colspan: 2 },
            { row: 3, col: 3, rowspan: 1, colspan: 2 },
            { row: 4, col: 0, rowspan: 1, colspan: 2 },
            { row: 4, col: 3, rowspan: 1, colspan: 2 },
            { row: 5, col: 0, rowspan: 1, colspan: 2 },
            { row: 5, col: 3, rowspan: 1, colspan: 3 },
            { row: 6, col: 0, rowspan: 1, colspan: 5 },
            { row: 7, col: 0, rowspan: 1, colspan: 2 },
            { row: 7, col: 3, rowspan: 1, colspan: 3 },
        ]
    }
    loansHotData = (data?: string[][]): string[][] => {
        if (data) {
            this.loansHot().loadData(data);
            this.loansHot().updateSettings(this.loansHotSettings);
        }
        return this.loansHot().getSourceData() as string[][];
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
            this.loansHotData(this.loanData);
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

    initializeDates(): void {
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
        this.billStartDate = this.startDate ? new Date(this.startDate) : new Date(now.toISOString().substr(0, 8) + start);
        this.billEndDate = this.endDate ? new Date(this.endDate) : new Date(now.toISOString().substr(0, 8) + end);
    }

    save(): void {
        this.producerService.updateProducer(this.selectedProducer).subscribe();
    }

    get loansHotId(): string {
        return this.hotId + '-loan';
    }
    get mergeCells(): { row: number, col: number, rowspan: number, colspan: number }[] {
        let cells: { row: number, col: number, rowspan: number, colspan: number }[] = [];
        let rowSpan: number = 0;
        for (let i = 0; i < this.selectedProducerProcurements.length - 1; i++) {
            if (this.selectedProducerProcurements[i].date == this.selectedProducerProcurements[i + 1].date) {
                rowSpan++;
            }
            else {
                cells.push({ row: i - rowSpan, col: 0, rowspan: rowSpan + 1, colspan: 1 });
                rowSpan = 0;
            }
        }
        if (rowSpan > 0) {
            cells.push({ row: this.selectedProducerProcurements.length - 1 - rowSpan, col: 0, rowspan: rowSpan + 1, colspan: 1 });
        }
        return cells;
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
    get loanData(): string[][] {
        return [
            ['Rate/Ltr.', this.rate, 'Incentive/Ltr.', this.incentiveRate, 'Total Rate/Ltr.', this.totalRate],
            [this.selectedProducer?.loanDate || this.billStartDate.toLocaleDateString(),
                'Loan Rs.', this.selectedProducer?.loanAmount?.toString(),
            this.selectedProducer?.loan2Amount?.toString(), this.selectedProducer?.loan2Date],
            ['Cattle Loan Rs.', '', this.cattleLoan.toString(), 'Total Amount Rs.', '', this.totalAmount.toString()],
            ['Interest Rs.', '', this.selectedProducer?.interestAmount?.toString(), 'Recoveries Rs.', '', this.selectedProducer?.recoveriesAmount?.toString()],
            ['Other Rs.', '', this.selectedProducer?.otherAmount?.toString(), 'Net Payment Rs.', '', this.netPayment?.toString()],
            ['Total Recoveries Rs.', '', this.totalRecoveries?.toString()],
            ['Rounded Net Value Rs.', '', '', '', '', this.roundedNetValue?.toString()],
            ['Cattle Loan Balance Rs.', '', this.cattleLoanBallance?.toString()]
        ];
    }
    get netPayment(): number {
        return this.totalAmount - (this.selectedProducer?.recoveriesAmount || 0);
    }
    get roundedNetValue(): number {
        return Math.round(this.netPayment);
    }
    get cattleLoan(): number {
        return this.roundedNetValue - (this.selectedProducer?.interestAmount || 0);
    }
    get totalRecoveries(): number {
        return this.cattleLoan + (this.selectedProducer?.interestAmount || 0) + (this.selectedProducer?.otherAmount || 0);
    }
    get cattleLoanBallance(): number {
        return (this.selectedProducer?.loanAmount || 0) - this.cattleLoan;
    }
    get saveButtonPositionX(): number {
        let ref = document.getElementsByClassName('reference-cell')[0];
        if (ref) {
            let position = ref.getBoundingClientRect();
            return position.x + (position.width >= 200 ? position.width - 200 : 0) / 2;
        }
        return 100;
    }
}