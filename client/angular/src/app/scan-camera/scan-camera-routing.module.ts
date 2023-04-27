import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScanCameraComponent } from './scan-camera.component';

const routes: Routes = [{ path: '', component: ScanCameraComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanCameraRoutingModule {}
