import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { IProcurement, Procurement } from "../procurement";
import { ProcurementService, ProducerService } from '../services';
import { Router } from '@angular/router';

@Component({
    selector: 'procurements-sheet',
    styleUrls: ['./procurements-sheet.component.css'],
    templateUrl: './procurements-sheet.component.html'
})
export class ProcurementsSheetComponent implements OnInit {

    constructor(private service: ProcurementService,
        private producerService: ProducerService,
        private changeDetector: ChangeDetectorRef,
        private router: Router) {
        let now = new Date();
        this.procurementDate = new Date(now.toISOString().substr(0, 10));
    }

    private hotRegisterer = new HotTableRegisterer();

    ngOnInit(): void {
        this.producerService.getProducers().subscribe(resp => {
            this.producerIds = resp.map(x => x.code);
            if (this.producerIds.length > 0) {
                this.service.getProcurements(this.procurementDate, this.procurementShift).subscribe(resp => {
                    this.procurements = resp;
                    this.hot().loadData(this.procurements);
                })
            }
            else {
                window.alert('Please add Producers first!!')
                this.router.navigate(['producers'])
            }
        })
    }

    title: string = 'Procurements Sheet';
    hotId = 'procurements-sheet';
    allowSave: boolean = false;
    procurements: IProcurement[] = [];
    procurementDate: Date;
    procurementShift: string = 'AM';
    rate: number = 590;
    incentiveRate: number = 10;
    premiumRate: number = 0.1;
    producerIds: string[] = [];

    hot = () => this.hotRegisterer.getInstance(this.hotId)
    dataChanged = (changes, source) => {
        changes = changes || [];
        changes.forEach(([row, prop, oldValue, newValue]) => {
            let rowData = this.hot().getSourceDataAtRow(row) as IProcurement;
            rowData.rate = rowData.rate && rowData.rate > 0 ? rowData.rate : this.rate;
            rowData.premiumRate = rowData.premiumRate && rowData.premiumRate > 0 ? rowData.premiumRate : this.premiumRate;
            rowData.incentiveRate = rowData.incentiveRate && rowData.incentiveRate > 0 ? rowData.incentiveRate : this.incentiveRate;
            this.calculate(rowData);
        });
        this.hot().validateCells(valid => {
            this.allowSave = valid;
            this.changeDetector.detectChanges();
        });
    }
    dateRenderer = (hotInstance, TD, row, col, prop, value, cellProperties) => {
        let date = this.procurementDate;
        if (value instanceof Date) {
            date = value as Date;
        }
        else if ((new Date(value)).toString() != 'Invalid Date') {
            date = new Date(value);
        }
        TD.innerHTML = date.toLocaleDateString();
        TD.style.backgroundColor = '#f0f0f0';
    }

    hotSettings: Handsontable.GridSettings = {
        licenseKey: 'non-commercial-and-evaluation',
        columns: [
            { title: 'Date', data: 'date', readOnly: true, renderer: this.dateRenderer },
            { title: 'Shift', data: 'shift', validator: /^AM$|^PM$/, readOnly: true },
            { title: 'Producer code', data: 'producerCode', validator: (value, cb) => cb(this.producerIds.includes(value)) },
            { title: 'Quantity', data: 'quantity', type: 'numeric', validator: (value, cb) => cb(value > 0) },
            { title: 'Fat', data: 'fat', type: 'numeric', validator: (value, cb) => cb(value > 0) },
            { title: 'Kg Fat', data: 'kgFat', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.000' } },
            { title: 'Gross Amount', data: 'grossAmount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Incentive', data: 'incentiveAmount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            { title: 'Total Amount', data: 'totalAmount', readOnly: true, type: 'numeric', numericFormat: { pattern: '0,0.00' } },
            //{ title: 'Sample No.', data: 'sampleNumber', validator: /^$|^\d{1,}$/ },
        ],
        dataSchema: {
            date: this.procurementDate,
            producerCode: '',
            shift: this.procurementShift,
            rate: this.rate,
            premiumRate: this.premiumRate,
            incentiveRate: this.incentiveRate,
            quantity: null,
            fat: null,
            kgFat: null,
            grossAmount: null,
            incentiveAmount: null,
            totalAmount: null,
            sampleNumber: '',
        },
        stretchH: 'all',
        readOnlyCellClassName: 'read-only-class',
        allowInsertRow: true,
        colHeaders: true,
        afterChange: this.dataChanged,
        contextMenu: {
            items: {
                "validateData": {
                    name: "Validate Data",
                    callback: (key, options) => {
                        this.procurements.forEach(p => this.calculate(p))
                        this.hot().validateCells(valid => {
                            this.allowSave = valid;
                            this.changeDetector.detectChanges();
                        });
                    }
                },
                "deleteProcurement": {
                    name: "Delete Procurement",
                    callback: (key, options) => {
                        let data = this.hot().getSourceData() as IProcurement[];
                        if (options.length > 0 && options[0].start.row == options[0].end.row) {
                            this.service.deleteProcurement(data[options[0].start.row]).subscribe(resp => {
                                data.splice(options[0].start.row, 1);
                                this.hot().loadData(data);
                            });
                        }
                    },
                    hidden: () => {
                        let range = this.hot().getSelectedRangeLast();
                        let data = this.hot().getSourceData() as IProcurement[];
                        if (range.from.row != range.to.row || (!data[range.from.row]._id)) {
                            return true;
                        }
                        return false;
                    }
                },
                "deleteRow": {
                    name: "Delete Row(s)",
                    callback: (key, options) => {
                        let data = this.hot().getSourceData() as IProcurement[];
                        if (options.length > 0 && options[0].start.row <= options[0].end.row) {
                            for (let i = options[0].start.row; i <= options[0].end.row; i++) {
                                data.splice(i, 1);
                            }
                            this.hot().loadData(data);
                        }
                    },
                    hidden: () => {
                        let range = this.hot().getSelectedRangeLast();
                        let data = this.hot().getSourceData() as IProcurement[];
                        for (let i = Math.min(range.from.row, range.to.row); i <= Math.max(range.from.row, range.to.row); i++) {
                            if (data[i]._id) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }
        }
    }

    changeDate(event: Event): void {
        let date = event.target['valueAsDate'];
        if (date && date instanceof Date) {
            this.procurementDate = date;
            this.service.getProcurements(this.procurementDate, this.procurementShift).subscribe(resp => {
                this.procurements = resp;
                this.hot().loadData(this.procurements);
            })
        }
    }

    changeShift(event: Event): void {
        this.procurementShift = event.target['value'];
        this.service.getProcurements(this.procurementDate, this.procurementShift).subscribe(resp => {
            this.procurements = resp;
            this.hot().loadData(this.procurements);
        })
    }

    addProcurement(): void {
        this.procurements.push(new Procurement(this.procurementDate, this.procurementShift, this.rate, this.incentiveRate, this.premiumRate, '', ''))
        this.hot().loadData(this.procurements);
    }

    save(): void {
        if (this.allowSave) {
            let data = this.hot().getSourceData() as IProcurement[];
            data.forEach(p => {
                if (p._id) {
                    this.service.updateProcurement(p).subscribe();
                }
                else {
                    this.service.addProcurement(p).subscribe();
                }
            })
        }
    }

    calculate(procurement: IProcurement): void {
        procurement.kgFat = procurement.quantity * Math.min(procurement.fat, 10) / 100;
        //procurement.kgFat = this.roundToDecimal(procurement.kgFat, 2);
        procurement.grossAmount = procurement.kgFat * procurement.rate
            + procurement.quantity * procurement.premiumRate * Math.max(0, procurement.fat - 10) * 10;
        //procurement.grossAmount = this.roundToDecimal(procurement.grossAmount, 2);
        procurement.incentiveAmount = procurement.kgFat * procurement.incentiveRate;
        //procurement.incentiveAmount = this.roundToDecimal(procurement.incentiveAmount, 2);
        procurement.totalAmount = procurement.grossAmount + procurement.incentiveAmount;
    }

    roundToDecimal(value: number, decimals: number): number {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
}