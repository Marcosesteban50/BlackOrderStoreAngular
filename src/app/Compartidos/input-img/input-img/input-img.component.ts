import { Component, EventEmitter, Input, Output } from '@angular/core';
import { toBase64 } from './toBase64';

@Component({
  selector: 'app-input-img',
  imports: [],
  templateUrl: './input-img.component.html',
  styleUrl: './input-img.component.css'
})
export class InputImgComponent {
  @Input({ required: true })
  title!: string;

  @Input()
  currentImageUrls?: string[];

  @Output()
  fileSelected = new EventEmitter<File[]>();

  @Output()
  currentImageDeleted = new EventEmitter<string>();


  // File we send to the backend
  selectedFiles: File[] = [];


  // Image converted from Bytes to a string representation to send to the frontend
  imagesBase64: string[] = [];



  async onChange(event: Event) {

    const input = event.target as HTMLInputElement;


    // If a file was selected
    if (!input.files?.length) {
      return;
    }

    const newFiles = Array.from(input.files);


    // With ... we push the elements of the array, not the array itself
    this.selectedFiles.push(...newFiles);




    for (const x of newFiles) {
      try {
        const base64 = await toBase64(x);

        this.imagesBase64.push(base64);
      }
      catch (error) {
        console.error(error);
      }
    }


    console.log('Selected Files', this.selectedFiles);

    // Send ALL of them to the parent component
    this.fileSelected.emit(this.selectedFiles);

    // Allows selecting the same file again
    input.value = '';
  }



  deleteCurrentImage(index: number) {


    // If there are no current images, do nothing
    if (!this.currentImageUrls) {
      return;
    }

    // Save the image URL before deleting it, i.e., the image itself
    const deletedImage = this.currentImageUrls[index];

    // Remove it visually
    this.currentImageUrls.splice(index, 1);

    // Notify the parent which existing image was deleted
    this.currentImageDeleted.emit(deletedImage);
  }

  deleteAllImages() {


    this.selectedFiles = [];
    this.imagesBase64 = [];

    // Send the updated list
    this.fileSelected.emit(
      this.selectedFiles
    );
  }


  deleteImage(index: number) {


    // Delete the selected photo we send to the backend, e.g., dog.jpg
    this.selectedFiles.splice(index, 1);


    // Delete the selected photo to display on the page
    this.imagesBase64.splice(index, 1);

    // Send the updated list
    this.fileSelected.emit(
      this.selectedFiles
    );
  }
}
