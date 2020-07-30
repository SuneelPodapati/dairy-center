import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProducersSheetComponent } from "./producers";
import { ProcurementsSheetComponent } from './procurement';
import { ProducersBillComponent } from './producers-bill';

const routes: Routes = [
  {
    path: 'producers',
    component: ProducersSheetComponent
  },
  {
    path: 'procurements',
    component: ProcurementsSheetComponent
  },
  {
    path: 'producers-bill',
    component: ProducersBillComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
