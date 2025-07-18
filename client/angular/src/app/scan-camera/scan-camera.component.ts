import { ToasterService } from '@abp/ng.theme.shared';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { QRDecodeOutput } from '../decrypt/qr-decode-output';
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
    this.decrypt(
      this.sysImage
        .replace('data:image/jpg', 'data:image/png')
        .replace('data:image/jpeg', 'data:image/png')
    );
  }
  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }
  b64toBlob(b64Data: string, contentType: string, sliceSize = 512): Blob {
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

    const blob = new Blob(byteArrays, { type: contentType });
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
          let blob = this.b64toBlob(r.data, r.contentType);
          let objectURL = URL.createObjectURL(blob);
          let a: any = document.createElement('a');
          document.body.appendChild(a);
          a.style = 'display: none';
          a.href = objectURL;
          // let extension = this.detectMime(r.contentType);
          a.download = r.fileName;
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
  detectMime(contentType: string): string {
    let extension = 'png';
    if (contentType.includes('image') && contentType.includes('png')) {
      extension = 'png';
    } else if (contentType.includes('image') && contentType.includes('jpg')) {
      extension = 'jpg';
    } else if (contentType.includes('audio') && contentType.includes('aac')) {
      extension = 'aac';
    } else if (contentType.includes('application') && contentType.includes('x-abiword')) {
      extension = 'abw';
    } else if (contentType.includes('application') && contentType.includes('x-freearc')) {
      extension = 'arc';
    } else if (contentType.includes('image') && contentType.includes('avif')) {
      extension = 'avif';
    } else if (contentType.includes('video') && contentType.includes('x-msvideo')) {
      extension = 'avi';
    } else if (contentType.includes('application') && contentType.includes('vnd.amazon.ebook')) {
      extension = 'azw';
    } else if (contentType.includes('application') && contentType.includes('octet-stream')) {
      extension = 'bin';
    } else if (contentType.includes('image') && contentType.includes('bmp')) {
      extension = 'bmp';
    } else if (contentType.includes('application') && contentType.includes('z')) {
      extension = 'bz';
    } else if (contentType.includes('application') && contentType.includes('x-bzip2')) {
      extension = 'bz2';
    } else if (contentType.includes('application') && contentType.includes('x-cdf')) {
      extension = 'cda';
    } else if (contentType.includes('application') && contentType.includes('x-csh')) {
      extension = 'csh';
    } else if (contentType.includes('text') && contentType.includes('css')) {
      extension = 'css';
    } else if (contentType.includes('text') && contentType.includes('csv')) {
      extension = 'csv';
    } else if (contentType.includes('application') && contentType.includes('msword')) {
      extension = 'doc';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      extension = 'docx';
    } else if (contentType.includes('application') && contentType.includes('vnd.ms-fontobject')) {
      extension = 'eot';
    } else if (contentType.includes('application') && contentType.includes('epub+zip')) {
      extension = 'epub';
    } else if (contentType.includes('application') && contentType.includes('gzip')) {
      extension = 'gz';
    } else if (contentType.includes('image') && contentType.includes('gif')) {
      extension = 'gif';
    } else if (contentType.includes('text') && contentType.includes('html')) {
      extension = 'html';
    } else if (contentType.includes('image') && contentType.includes('vnd.microsoft.icon')) {
      extension = 'ico';
    } else if (contentType.includes('text') && contentType.includes('calendar')) {
      extension = 'ics';
    } else if (contentType.includes('application') && contentType.includes('java-archive')) {
      extension = 'jar';
    } else if (contentType.includes('image') && contentType.includes('jpeg')) {
      extension = 'jpg';
    } else if (contentType.includes('text') && contentType.includes('javascript')) {
      extension = 'js';
    } else if (contentType.includes('application') && contentType.includes('json')) {
      extension = 'json';
    } else if (contentType.includes('application') && contentType.includes('ld+json')) {
      extension = 'jsonld';
    } else if (contentType.includes('audio') && contentType.includes('midi')) {
      extension = 'midi';
    } else if (contentType.includes('audio') && contentType.includes('x-midi')) {
      extension = 'midi';
    } else if (contentType.includes('text') && contentType.includes('javascript')) {
      extension = 'mjs';
    } else if (contentType.includes('audio') && contentType.includes('mpeg')) {
      extension = 'mp3';
    } else if (contentType.includes('video') && contentType.includes('mp4')) {
      extension = 'mp4';
    } else if (contentType.includes('video') && contentType.includes('mpeg')) {
      extension = 'mpeg';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.apple.installer+xml')
    ) {
      extension = 'mpkg';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.oasis.opendocument.presentation')
    ) {
      extension = 'odp';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.oasis.opendocument.spreadsheet')
    ) {
      extension = 'ods';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.oasis.opendocument.text')
    ) {
      extension = 'odt';
    } else if (contentType.includes('audio') && contentType.includes('ogg')) {
      extension = 'oga';
    } else if (contentType.includes('video') && contentType.includes('ogg')) {
      extension = 'ogv';
    } else if (contentType.includes('application') && contentType.includes('ogg')) {
      extension = 'ogx';
    } else if (contentType.includes('audio') && contentType.includes('opus')) {
      extension = 'opus';
    } else if (contentType.includes('font') && contentType.includes('otf')) {
      extension = 'otf';
    } else if (contentType.includes('image') && contentType.includes('png')) {
      extension = 'png';
    } else if (contentType.includes('application') && contentType.includes('pdf')) {
      extension = 'pdf';
    } else if (contentType.includes('application') && contentType.includes('x-httpd-php')) {
      extension = 'php';
    } else if (contentType.includes('application') && contentType.includes('vnd.ms-powerpoint')) {
      extension = 'ppt';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.openxmlformats-officedocument.presentationml.presentation')
    ) {
      extension = 'pptx';
    } else if (contentType.includes('application') && contentType.includes('vnd.rar')) {
      extension = 'rar';
    } else if (contentType.includes('application') && contentType.includes('rtf')) {
      extension = 'rtf';
    } else if (contentType.includes('application') && contentType.includes('x-sh')) {
      extension = 'sh';
    } else if (contentType.includes('image') && contentType.includes('svg+xml')) {
      extension = 'svg';
    } else if (contentType.includes('application') && contentType.includes('x-tar')) {
      extension = 'tar';
    } else if (contentType.includes('image') && contentType.includes('tiff')) {
      extension = 'tiff';
    } else if (contentType.includes('video') && contentType.includes('mp2t')) {
      extension = 'ts';
    } else if (contentType.includes('font') && contentType.includes('ttf')) {
      extension = 'ttf';
    } else if (contentType.includes('text') && contentType.includes('plain')) {
      extension = 'txt';
    } else if (contentType.includes('application') && contentType.includes('vnd.visio')) {
      extension = 'vsd';
    } else if (contentType.includes('audio') && contentType.includes('wav')) {
      extension = 'wav';
    } else if (contentType.includes('audio') && contentType.includes('webm')) {
      extension = 'weba';
    } else if (contentType.includes('video') && contentType.includes('webm')) {
      extension = 'webm';
    } else if (contentType.includes('image') && contentType.includes('webp')) {
      extension = 'webp';
    } else if (contentType.includes('font') && contentType.includes('woff')) {
      extension = 'woff';
    } else if (contentType.includes('font') && contentType.includes('woff2')) {
      extension = 'woff2';
    } else if (contentType.includes('application') && contentType.includes('xhtml+xml')) {
      extension = 'xhtml';
    } else if (contentType.includes('application') && contentType.includes('vnd.ms-excel')) {
      extension = 'xls';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.openxmlformats-officedocument.presentationml.presentation')
    ) {
      extension = 'pptx';
    } else if (contentType.includes('application') && contentType.includes('vnd.rar')) {
      extension = 'rar';
    } else if (contentType.includes('application') && contentType.includes('rtf')) {
      extension = 'rtf';
    } else if (contentType.includes('application') && contentType.includes('x-sh')) {
      extension = 'sh';
    } else if (contentType.includes('image') && contentType.includes('svg+xml')) {
      extension = 'svg';
    } else if (contentType.includes('application') && contentType.includes('x-tar')) {
      extension = 'tar';
    } else if (contentType.includes('image') && contentType.includes('tiff')) {
      extension = 'tiff';
    } else if (contentType.includes('video') && contentType.includes('mp2t')) {
      extension = 'ts';
    } else if (contentType.includes('font') && contentType.includes('ttf')) {
      extension = 'ttf';
    } else if (contentType.includes('text') && contentType.includes('plain')) {
      extension = 'txt';
    } else if (contentType.includes('application') && contentType.includes('vnd.visio')) {
      extension = 'vsd';
    } else if (contentType.includes('audio') && contentType.includes('wav')) {
      extension = 'wav';
    } else if (contentType.includes('audio') && contentType.includes('webm')) {
      extension = 'weba';
    } else if (contentType.includes('video') && contentType.includes('webm')) {
      extension = 'webm';
    } else if (contentType.includes('image') && contentType.includes('webp')) {
      extension = 'webp';
    } else if (contentType.includes('font') && contentType.includes('woff')) {
      extension = 'woff';
    } else if (contentType.includes('font') && contentType.includes('woff2')) {
      extension = 'woff2';
    } else if (contentType.includes('application') && contentType.includes('xhtml+xml')) {
      extension = 'xhtml';
    } else if (contentType.includes('application') && contentType.includes('vnd.ms-excel')) {
      extension = 'xls';
    } else if (
      contentType.includes('application') &&
      contentType.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ) {
      extension = 'xlsx';
    } else if (contentType.includes('application') && contentType.includes('xml')) {
      extension = 'xml';
    } else if (contentType.includes('application') && contentType.includes('vnd.mozilla.xul+xml')) {
      extension = 'xul';
    } else if (contentType.includes('application') && contentType.includes('zip')) {
      extension = 'zip';
    } else if (contentType.includes('video') && contentType.includes('3gpp')) {
      extension = '3gp';
    } else if (contentType.includes('audio') && contentType.includes('3gpp')) {
      extension = '3gp';
    } else if (contentType.includes('video') && contentType.includes('3gpp2')) {
      extension = '3g2';
    } else if (contentType.includes('audio') && contentType.includes('3gpp2')) {
      extension = '3g2';
    } else if (contentType.includes('application') && contentType.includes('x-7z-compressed')) {
      extension = '7z';
    }
    return extension;
  }
}
