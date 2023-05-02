import {
  HttpClient,
  HttpEvent,
  HttpUploadProgressEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { QREncodeOutput } from './qr-encode-output.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss'],
})
export class GenerateComponent {
  files: Array<File> = [];
  previewSrc: SafeUrl | null = null;
  base64: string = '';
  blob: Blob | null = null;
  QRId: string = '';
  expDate: Date | null = null;
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  onSelect(event: any) {
    if (this.files && this.files.length >= 1) {
      this.onRemove(this.files[0]);
    }
    this.files.push(...event.addedFiles);
  }
  DownloadImage() {
    let base64: string = '';
    let split = (this.base64 + '').split(',');
    if (split.length > 1) {
      base64 = split[1];
    } else {
      base64 = split[0];
    }
    this.blob = this.b64toBlob(base64);
    const blobUrl = URL.createObjectURL(this.blob);

    // Create a link element
    const link: any = document.createElement('a');

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = this.QRId;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );

    // Remove link from body
    document.body.removeChild(link);
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
  dataURItoBlob(dataURI: string): Blob {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  async generateBase64(f: File): Promise<string> {
    let b64 = await this.toBase64(f);
    return b64;
  }
  toBase64(f: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result?.toString() || '');
      reader.onerror = error => reject(error);
    });
  }
  isHttpProgressEvent(input: HttpEvent<unknown>): input is HttpUploadProgressEvent {
    return input.type === HttpEventType.UploadProgress;
  }
  generateQR() {
    let file = this.files[0];
    let headers = new HttpHeaders({
      'Content-Type': file.type,
    });
    let options = { headers: headers };
    this.http
      .post<QREncodeOutput>(environment.apis.qr.encrypt + '/generate', file, options)
      .subscribe(
        r => {
          this.blob = this.b64toBlob(r.data);
          let objectURL = window.URL.createObjectURL(this.blob);
          this.previewSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.QRId = r.id;
          this.expDate = r.expirationDate;
          this.base64 = r.data;
        },
        e => {
          console.log({ e });
        }
      );
  }
}
