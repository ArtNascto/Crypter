import { ToasterService } from '@abp/ng.theme.shared';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { QRDecodeOutput } from '../decrypt/qr-decode-output';
import * as mime from 'mime-db';
@Component({
  selector: 'app-scan-camera',
  templateUrl: './scan-camera.component.html',
  styleUrls: ['./scan-camera.component.scss'],
})
export class ScanCameraComponent {
  private trigger: Subject<void> = new Subject();
  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<void> = new Subject();
  sysImage = '';
  constructor(private http: HttpClient, private toaster: ToasterService) {}
  public getSnapshot(): void {
    this.trigger.next(void 0);
  }
  public captureImg(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.sysImage = webcamImage!.imageAsDataUrl;
    this.decrypt(this.sysImage.replace("data:image/jpg","data:image/png").replace("data:image/jpeg","data:image/png"));
  }
  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }
  b64toBlob(b64Data: string, sliceSize = 512): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'image/png' });
    return blob;
  }
  decrypt(data: string) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let options = { headers: headers };
    this.http
      .post<QRDecodeOutput>(
        environment.apis.qr.decrypt + '/decrypt',
        {
          data: data,
        },
        options
      )
      .subscribe(
        r => {
          let blob = this.b64toBlob(r.data);
          let objectURL = URL.createObjectURL(blob);
          let a: any = document.createElement('a');
          document.body.appendChild(a);
          a.style = 'display: none';
          a.href = objectURL;
          let ext = mime[r.contentType];
          let extension = 'png';
          if (ext.extensions) {
            extension = ext.extensions[0];
          }
          a.download = r.id + '.' + extension;
          a.click();
          window.URL.revokeObjectURL(objectURL);
          this.toaster.success('Seu arquivo foi baixado!');
        },
        (e: HttpErrorResponse) => {
          console.log({ e });
          this.toaster.error(e.error.error);
        }
      );
  }
}
