import { Component, OnInit } from "@angular/core";
import { ProcurementService, ProducerService, AppStore } from '../services';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { IBillSummary, IProducer } from '../models'
import { Router } from "@angular/router";

@Component({
    selector: 'bill-summary',
    styleUrls: ['./bill-summary.component.css'],
    templateUrl: './bill-summary.component.html'
})
export class BillSummaryComponent implements OnInit {

    private hotRegisterer = new HotTableRegisterer();

    constructor(private procurementService: ProcurementService,
        private producerService: ProducerService,
        private router: Router,
        private store: AppStore) {
        let dates = this.store.getDates();
        this.billStartDate = dates.startDate;
        this.billEndDate = dates.endDate;
    }

    ngOnInit(): void {
        this.producerService.getProducers().subscribe(producers => {
            if (producers.length > 0) {
                this.billData = producers.map(p => (
                    {
                        code: p.code,
                        name: p.name,
                        quantity: 0,
                        amount: 0
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
    hotId = 'bill-summary';
    hot = () => this.hotRegisterer.getInstance(this.hotId)
    hotData = (data?: IBillSummary[]): IBillSummary[] => {
        if (data) {
            this.hot().loadData(data);
        }
        return this.hot().getSourceData() as IBillSummary[];
    }

    billStartDate: Date;
    billEndDate: Date;
    showTotal: boolean = false;
    billData: IBillSummary[] = [];

    hotSettings: Handsontable.GridSettings = {
        licenseKey: 'non-commercial-and-evaluation',
        columns: [
            { title: 'Producer Code', data: 'code', readOnly: true, className: 'htMiddle' },
            { title: 'Producer Name', data: 'name', readOnly: true, className: 'text-left htMiddle' },
            { title: 'Quantity (Ltrs.)', data: 'quantity', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' },
            { title: 'Amount', data: 'amount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' },
            { title: 'Signature', readOnly: true, className: 'reference-cell htMiddle' }
        ],
        colWidths: ['150', '350', '150', '150', '200'],
        readOnlyCellClassName: 'not-dimmed',
        colHeaders: true,
        manualColumnFreeze: true,
        tableClassName: "center bill-summary-table"
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
                    amount: Math.round(procurements.filter(x => x.producerCode == p.code).reduce((s, c) => s + c.totalAmount, 0))
                }));
            this.hot().loadData(this.billData);
            this.showTotal = false;
        });
    }

    changeShowTotal(event: Event): void {
        this.showTotal = event.target['checked'];
        if (this.showTotal) {
            let data = this.hotData();
            let total: IBillSummary = {
                code: '',
                name: 'Total',
                quantity: this.billData.reduce((s, c) => s + c.quantity, 0),
                amount: this.billData.reduce((s, c) => s + c.amount, 0)
            };
            this.hotData([...data, total]);
        }
        else {
            this.hotData(this.hotData().slice(0, -1));
        }

    }

    print(): void {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'display: none';
        document.body.appendChild(iframe);
        const doc = iframe.contentDocument;
        let printWidths = ['10%', '30%', '12%', '12%', '36%'];
        let title = document.getElementsByTagName('app-title')[0].outerHTML;
        let subTitle = document.getElementsByClassName('bill-summary-title')[0].outerHTML;
        let table = document.querySelector('.ht_master .bill-summary-table');
        let tHtml = table.outerHTML.replace(/<colgroup>.*<\/colgroup>/g, '');
        doc.open('text/html', 'replace');
        var html = `<!doctype html><html><head>
        <style>
        table {
            border-collapse: collapse;
            text-align: center;
            vertical-align: middle;
        }
        td, th {
            height: 66px;
            border: 1px solid black;
            border-collapse: collapse;
        }
        @media print {
            .no-print {
                display: none;
            }
        
            .print {
                display: inline;
            }
        }
        .header {
            padding: 10px;
            background-color: #cdcdcd;
            text-align: center;
            text-transform: uppercase;
            font-family: sans-serif;
            font-weight: 700;
            color: darkcyan;
        }
        body {
            font-weight: 400;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .center {
            text-align: center;
        }

        ${printWidths.reduce((t, e, i) => t +
            `th:nth-child(${(i + 1)}), td:nth-child(${(i + 1)}) {
                width: ${e} !important;
            }
            `, '')
            }
        </style>
            </head><body>${title}${subTitle}<br />${tHtml}</body></html>`;
        doc.write(html);
        doc.close();
        doc.defaultView.print();
        setTimeout(() => {
            // this code will be executed 10ms after you close printing window
            iframe.parentElement.removeChild(iframe);
        }, 10);
    }
}