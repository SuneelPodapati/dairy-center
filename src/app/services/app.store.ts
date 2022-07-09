import { Injectable } from "@angular/core";

@Injectable()
export class AppStore {
    spinner: boolean = false;

    store<T>(data: T, key: string): void {
        localStorage[key] = JSON.stringify(data);
    }

    load<T>(key: string): T {
        let data = localStorage[key];
        return data != 'undefined' && data != null && typeof (data) == 'string' ? JSON.parse(data) : null;
    }

    getDates(startDate?, endDate?): { startDate: Date, endDate: Date } {
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
        let billStartDate = startDate ? new Date(startDate) : new Date(now.toISOString().substr(0, 8) + start);
        let billEndDate = endDate ? new Date(endDate) : new Date(now.toISOString().substr(0, 8) + end);
        return { startDate: billStartDate, endDate: billEndDate };
    }
}