import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HotTableModule } from '@handsontable/angular';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from './app.component';
import { ProducersSheetComponent } from "./producers";
import { ProducerService, SpinnerInterceptor, AppStore, ProcurementService } from "./services";
import { ProcurementsSheetComponent } from './procurement';
import { ProducersBillComponent } from "./producers-bill";

@NgModule({
  declarations: [
    AppComponent,
    ProducersSheetComponent,
    ProcurementsSheetComponent,
    ProducersBillComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HotTableModule,
    HttpClientModule
  ],
  providers: [
    ProducerService,
    ProcurementService,
    AppStore,
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
