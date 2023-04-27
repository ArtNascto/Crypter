import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ScanCameraRoutingModule } from './scan-camera-routing.module';
import { ScanCameraComponent } from './scan-camera.component';

@NgModule({
  declarations: [ScanCameraComponent],
  imports: [SharedModule, ScanCameraRoutingModule, NgxDropzoneModule],
})
export class GenerateModule {}
