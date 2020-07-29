import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProducersSheetComponent } from "./producers";
import { ProcurementsSheetComponent } from './procurement';

const routes: Routes = [
  {
    path: 'producers',
    component: ProducersSheetComponent
  },
  {
    path: 'procurements',
    component: ProcurementsSheetComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
