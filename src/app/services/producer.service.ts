import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { IProducer } from '../producers';

@Injectable()
export class ProducerService {
    constructor(private http: HttpClient) { }

    private url: string = 'http://localhost:8080/api/Producer'

    getProducers(): Observable<IProducer[]> {
        return this.http.get<IProducer[]>(this.url);
    }

    addProducer(producer: IProducer) {
        return this.http.post(this.url, producer);
    }

    updateProducer(producer: IProducer) {
        return this.http.put(this.url, producer);
    }

    deactivateProducer(producer: IProducer) {
        return this.http.delete(`${this.url}/${producer._id}`);
    }
}