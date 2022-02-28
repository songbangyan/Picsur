import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxDropzoneChangeEvent } from 'ngx-dropzone';
import { ProcessingViewMetadata } from '../../models/processing-view-metadata';

@Component({
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  constructor(private snackBar: MatSnackBar, private router: Router) {}
  onSelect(event: NgxDropzoneChangeEvent) {
    if (event.addedFiles.length > 1) {
      this.snackBar.open(
        'You uploaded multiple images, only one has been uploaded'
      );
    }

    const metadata: ProcessingViewMetadata = {
      imageFile: event.addedFiles[0],
    };
    this.router.navigate(['/processing'], { state: metadata });
  }
}