import { Component } from '@angular/core';
import { AppStore } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public store: AppStore) { }
  title = 'Sri Satya Sai Milk Line, Puretipalli';
  subtitle = 'Milk Collection center, Puretipalli';
  code = 'SSSMCC - 377';
}
