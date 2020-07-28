import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable()
export class AppStore {
    http: Observable<boolean> = of(false);
}