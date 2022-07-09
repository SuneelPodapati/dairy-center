import { Component, OnInit } from "@angular/core";
import { ProcurementService, ProducerService, AppStore } from '../services';
import { IProducer, IProducerProcurements } from '../models'
import { Router } from "@angular/router";

@Component({
    selector: 'print-all-bills',
    templateUrl: './print-all-bills.component.html'
})
export class PrintAllBillsComponent implements OnInit {

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
                this.data = producers.map(p => (
                    {
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

    billStartDate: Date;
    billEndDate: Date;
    data: IProducerProcurements[] = [];

    changeDate(event: Event, control: string): void {
        let date = event.target['valueAsDate'];
        if (date && date instanceof Date) {
            this[control] = date;
            this.updateData();
        }
    }

    updateData() {
        this.procurementService.getBillProcurements(this.billStartDate, this.billEndDate).subscribe(procurements => {
            this.data = this.data.map(p => ({
                ...p,
                procurements: procurements.filter(x => x.producerCode == p.producer.code)
            }));
        });
    }
}