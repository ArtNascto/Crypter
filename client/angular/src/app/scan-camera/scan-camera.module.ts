import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ScanCameraRoutingModule } from './scan-camera-routing.module';
import { ScanCameraComponent } from './scan-camera.component';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [ScanCameraComponent],
  imports: [SharedModule, ScanCameraRoutingModule, NgxDropzoneModule, WebcamModule],
})
export class ScanCameraModule {}
