import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HotTableModule } from '@handsontable/angular';
import { AppRoutingModule, GuardProducersSheet } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from './app.component';
import { AppTitleComponent } from './app-title.component';
import { ProducersSheetComponent } from "./producers";
import { ProducerService, SpinnerInterceptor, AppStore, ProcurementService } from "./services";
import { ProcurementsSheetComponent } from './procurement';
import { BillSummaryComponent } from "./bill-summary";
import { ProducerBillComponent } from "./producer-bill";
import { PrintAllBillsComponent } from './print-all-bills';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    AppTitleComponent,
    ProducersSheetComponent,
    ProcurementsSheetComponent,
    BillSummaryComponent,
    ProducerBillComponent,
    PrintAllBillsComponent
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
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
