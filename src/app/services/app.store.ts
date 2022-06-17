import { Injectable } from "@angular/core";

@Injectable()
export class AppStore {
    spinner: boolean = false;

    store<T>(data: T, key: string): void {
        localStorage[key] = JSON.stringify(data);
    }

    load<T>(key: string): T {
        let data = localStorage[key];
        return data != 'undefined' && data != null && typeof(data) == 'string' ? JSON.parse(data) : null;
    }
}