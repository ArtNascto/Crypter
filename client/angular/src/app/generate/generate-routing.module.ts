import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GenerateComponent } from './generate.component';

const routes: Routes = [{ path: '', component: GenerateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerateRoutingModule {}
