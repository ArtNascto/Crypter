import {
    Component,
    Input,
    OnInit,
    OnChanges,
    OnDestroy,
    Output,
    EventEmitter
} from '@angular/core';

import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

let PDFJS: any;

function isSSR() {
    return typeof window === 'undefined';
}

if (!isSSR()) {
    // @ts-ignore
    PDFJS = require('pdfjs-dist/build/pdf');
}

interface IPdfDocumentLoad {
    numPages: number;
}

@Component({
    selector: 'app-pdf-viewer',
    templateUrl: './pdf-viewer.component.html',
    styleUrls: ['./pdf-viewer.component.css']
})
export class PDFViewerComponent implements OnInit {
    @Input()
    pdfSrc: File | null = null;

    pdf: string = ""

    @Input()
    pageNumber = 1;

    totalPages: number = 0

    isPdfUploaded = false
    constructor() {
    }


    async ngOnInit(): Promise<void> {
        try {
            if (this.pdfSrc)
                if (typeof (FileReader) !== 'undefined') {
                    let reader = new FileReader();
                    reader.onload = (e: any) => {
                        this.pdfSrc = e.target.result;
                    };
                    this.isPdfUploaded = true;
                    reader.readAsArrayBuffer(this.pdfSrc);
                }
        } catch (error) {
            console.log(error);
        }
    }

    afterLoadComplete(pdf: any) {
        this.totalPages = pdf.numPages;
    }


}
