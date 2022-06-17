import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { IProcurement } from '../procurement';
import { environment } from "src/environments/environment";

@Injectable()
export class ProcurementService {
    constructor(private http: HttpClient) { }

    private url: string = `${environment.apiEndpoint}/api/Procurement`

    getProcurements(date: Date, shift?: string): Observable<IProcurement[]> {
        return this.http.get<IProcurement[]>(`${this.url}/${date.toISOString()}/${shift}`);
    }

    addProcurement(procurement: IProcurement) {
        return this.http.post(this.url, procurement);
    }

    updateProcurement(procurement: IProcurement) {
        return this.http.put(this.url, procurement);
    }

    deleteProcurement(procurement: IProcurement) {
        return this.http.delete(`${this.url}/${procurement._id}`);
    }

    getBillProcurements(fromDate: Date, toDate: Date, producerCode?: string): Observable<IProcurement[]> {
        return this.http.get<IProcurement[]>(`${this.url}/Bill/${fromDate.toISOString()}/${toDate.toISOString()}${(producerCode ? '/' + producerCode : '')}`);
    }
}