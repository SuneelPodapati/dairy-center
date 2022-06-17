import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppStore } from '../services';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
    static count: number = 0;
    constructor(private store: AppStore) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        SpinnerInterceptor.count++;
        this.store.spinner = true;
        return next.handle(req).pipe(map((event) => {
            if (event instanceof HttpResponse) {
                SpinnerInterceptor.count--;
                if (SpinnerInterceptor.count <= 0) {
                    this.store.spinner = false;
                }
            }
            return event;
        }));
    }

}