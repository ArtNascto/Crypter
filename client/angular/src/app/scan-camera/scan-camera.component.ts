import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import * as mime from 'mime-db';
import { QRDecodeOutput } from '../decrypt/qr-decode-output';
import { PageAlertService, ToasterService } from '@abp/ng.theme.shared';
import { WebcamComponent, WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-scan-camera',
  templateUrl: './scan-camera.component.html',
  styleUrls: ['./scan-camera.component.scss'],
})
export class ScanCameraComponent implements AfterViewInit {
  enabled: boolean = false;
  public captures: Array<any>;
  @ViewChild('webcam', { static: true }) //variable from html
  public webcam: WebcamComponent;
  @Output()
  public pictureTaken = new EventEmitter<WebcamImage>();
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    width: { ideal: 1024 },
    height: { ideal: 576 },
  };
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  constructor(
    private http: HttpClient,
    private service: PageAlertService,
    private toaster: ToasterService
  ) {
    this.captures = [];
  }

  ngAfterViewInit() {
    this.webcam.nativeVideoElement.style = 'width: 100% !important;height: 100% !important;';
  }

  //capture an image and add it to the captures array.
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
  public triggerSnapshot(): void {
    this.trigger.next();
  }
  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
  public handleInitError(error: WebcamInitError): void {}
  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }
  public handleImage(webcamImage: WebcamImage): void {
    this.decrypt(webcamImage.imageAsBase64);
    console.info('received webcam image', { webcamImage });
    this.pictureTaken.emit(webcamImage);
  }
  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}
