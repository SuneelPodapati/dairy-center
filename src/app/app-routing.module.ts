import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProducersSheetComponent } from "./producers";

const routes: Routes = [{
  path: 'producers',
  component: ProducersSheetComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
