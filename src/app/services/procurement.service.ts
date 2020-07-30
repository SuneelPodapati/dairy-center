import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { IProcurement } from '../procurement';

@Injectable()
export class ProcurementService {
    constructor(private http: HttpClient) { }

    private url: string = 'http://localhost:8080/api/Procurement'

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
}