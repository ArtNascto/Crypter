import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { QRDecodeOutput } from './qr-decode-output';
import { environment } from 'src/environments/environment';
import * as mime from 'mime-db';

@Component({
  selector: 'app-decrypt',
  templateUrl: './decrypt.component.html',
  styleUrls: ['./decrypt.component.scss'],
})
export class DecryptComponent {
  constructor(private http: HttpClient) {}

  filesDecode: Array<File> = [];
  onSelectDecode(event: any) {
    if (this.filesDecode && this.filesDecode.length >= 2) {
      this.onRemove(this.filesDecode[0]);
    }
    this.filesDecode.push(...event.addedFiles);
  }
  onRemove(event: any) {
    this.filesDecode.splice(this.filesDecode.indexOf(event), 1);
  }
  toBase64(f: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result?.toString() || '');
      reader.onerror = error => reject(error);
    });
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
  async decodeQR() {
    let file = this.filesDecode[0];
    this.toBase64(file).then(b64 => {
      const options = {
        headers: { 'Content-Type': 'application/json' },
      };
      this.http
        .post<QRDecodeOutput>(environment.apis.qr.decrypt + '/qr/Decrypt', { data: b64 }, options)
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
          e => {
            console.log({ e });
          }
        );
    });
  }
}
