import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DecryptRoutingModule } from './decrypt-routing.module';
import { DecryptComponent } from './decrypt.component';

@NgModule({
  declarations: [DecryptComponent],
  imports: [SharedModule, DecryptRoutingModule, NgxDropzoneModule],
})
export class DecryptModule {}
