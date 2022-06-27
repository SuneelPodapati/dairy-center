import { Component } from '@angular/core';

@Component({
    selector: 'app-title',
    template: `
        <header class="header">
            <div>
                <h1 class="title">{{title}}</h1>
                <ng-content></ng-content>
            </div>
        </header>`,
})
export class AppTitleComponent {
    title = 'Sri Satya Sai Milk Center, Puretipalli';
}
