import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpUploadProgressEvent,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { mimeTypes } from 'mime-wrapper';
import { QRDecodeOutput } from './interfaces/qr-decode-output';
import { QREncodeOutput } from './interfaces/qr-encode-output.interface';
import * as mime from 'mime-db';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  files: Array<File> = [];
  filesDecode: Array<File> = [];
  apiURL = 'http://localhost:8080';
  previewSrc: SafeUrl | null = null;
  base64: string = '';
  blob: Blob | null = null;
  QRId: string = '';
  expDate: Date | null = null;
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  onSelectDecode(event: any) {
    if (this.filesDecode && this.files.length >= 2) {
      this.onRemove(this.filesDecode[0]);
    }
    this.filesDecode.push(...event.addedFiles);
  }
  onSelect(event: any) {
    if (this.files && this.files.length >= 2) {
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
  onRemoveDecode(event: any) {
    this.filesDecode.splice(this.filesDecode.indexOf(event), 1);
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
      reader.onerror = (error) => reject(error);
    });
  }
  isHttpProgressEvent(
    input: HttpEvent<unknown>
  ): input is HttpUploadProgressEvent {
    return input.type === HttpEventType.UploadProgress;
  }
  generateQR() {
    let file = this.files[0];
    let headers = new HttpHeaders({
      'Content-Type': file.type,
    });
    let options = { headers: headers };
    this.http
      .post<QREncodeOutput>(this.apiURL + '/qr/Generate', file, options)
      .subscribe(
        (r) => {
          this.blob = this.b64toBlob(r.data);
          let objectURL = window.URL.createObjectURL(this.blob);
          this.previewSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.QRId = r.id;
          this.expDate = r.expirationDate;
          this.base64 = r.data;
        },
        (e) => {
          console.log({ e });
        }
      );
  }
  async decodeQR() {
    let file = this.filesDecode[0];
    this.toBase64(file).then((b64) => {
      const options = {
        headers: { 'Content-Type': 'application/json' },
      };
      this.http
        .post<QRDecodeOutput>(
          this.apiURL + '/qr/Decrypt',
          { data: b64 },
          options
        )
        .subscribe(
          (r: QRDecodeOutput) => {
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
          },
          (e) => {
            console.log({ e });
          }
        );
    });
  }
}
