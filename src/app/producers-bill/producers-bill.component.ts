import { Component, OnInit } from "@angular/core";
import { ProcurementService, ProducerService } from '../services';
import { IProducer } from "../producers/producer";
import { Router } from "@angular/router";

@Component({
    selector: 'producers-bill',
    styleUrls: ['./producers-bill.component.css'],
    templateUrl: './producers-bill.component.html'
})
export class ProducersBillComponent implements OnInit {

    constructor(private service: ProcurementService,
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
                // get data
            }
            else {
                window.alert('Please add Producers first!!')
                this.router.navigate(['producers'])
            }
        })
    }

    title: string = 'Producers Bill from';
    billStartDate: Date;
    billEndDate: Date;
    producers: IProducer[] = [];
    headers: string[] = [' Producer Code', 'Producer Name', 'Quantity', 'Amount', 'Signature'];

    changeDate(event: Event, control: string): void {
        let date = event.target['valueAsDate'];
        if (date && date instanceof Date) {
            this[control] = date;
            // get data
        }
    }
}