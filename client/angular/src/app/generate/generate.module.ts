import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { GenerateComponent } from './generate.component';
import { GenerateRoutingModule } from './generate-routing.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

@NgModule({
  declarations: [GenerateComponent],
  imports: [SharedModule, GenerateRoutingModule, NgxDropzoneModule],
})
export class GenerateModule {}
