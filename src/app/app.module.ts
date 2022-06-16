import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HotTableModule } from '@handsontable/angular';
import { AppRoutingModule, GuardProducersSheet } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from './app.component';
import { ProducersSheetComponent } from "./producers";
import { ProducerService, SpinnerInterceptor, AppStore, ProcurementService } from "./services";
import { ProcurementsSheetComponent } from './procurement';
import { ProducersBillComponent } from "./producers-bill";
import { ProducerBillComponent } from "./producer-bill";

@NgModule({
  declarations: [
    AppComponent,
    ProducersSheetComponent,
    ProcurementsSheetComponent,
    ProducersBillComponent,
    ProducerBillComponent
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
    GuardProducersSheet,
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
