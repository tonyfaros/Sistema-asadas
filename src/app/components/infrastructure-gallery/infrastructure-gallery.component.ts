import { Component, OnInit, Output, Inject, DoCheck, Input, HostListener, EventEmitter } from '@angular/core';
import { Infrastructure } from 'app/common/model/Infrastructure';
import { FirebaseImg } from 'app/common/model/FirebaseImg';
import { Chlorination } from '../../common/model/Chlorination';

import { AngularFireService } from '../../common/service/angularFire.service';
import * as firebase from 'firebase';
import { FirebaseApp } from 'angularfire2';

import { ToasterService, ToasterConfig } from 'angular2-toaster';

const lodash = require('lodash');

@Component({
  selector: 'app-infrastructure-gallery',
  templateUrl: './infrastructure-gallery.component.html',
  styleUrls: ['./infrastructure-gallery.component.scss'],
  providers: [AngularFireService,ToasterService]
})
export class InfrastructureGalleryComponent implements OnInit, DoCheck {

  public fullmode: boolean = false;

  public emptyGallery: boolean = true;
  public selectedImage: FirebaseImg;

  public currentImage: FirebaseImg;
  public selectedIndex: number;
  public indexString: string = "";


  private selectedImageFile: File;  //Copia descargada de la imagen seleccionada;
  private uploadedImageFile: File;  //Imagen subida

  private mainImageFile: File;       //Imagen actual que será seleccionada. selectedImageFile || uploadedImageFile

  public selectionMode: string = "upload";
  public tabIndex: number = 0

  private storageRef;

  constructor(
    @Inject(FirebaseApp) firebaseApp: any,
    private angularFireService: AngularFireService,
		private toasterService: ToasterService ) {
    this.indexString = ".";
    this.selectedIndex = 0;

    this.storageRef = firebaseApp.storage().ref();
  }
	/*		Toast variables		*/
	public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});


  @Output() onMainImageChanged: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();
  @Output() onClose: EventEmitter<Infrastructure> = new EventEmitter<Infrastructure>();
  @Output() onUploadingMainImage: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();
  @Output() onError: EventEmitter<{title:string,content:string}> = new EventEmitter<{title:string,content:string}>();

  @Input() public infrastructure: Chlorination;
  @Input() editMode: boolean = false;


  ngOnInit() {
    this.updateGallery();
  }

  ngDoCheck() {
    this.updateGallery();
  }

  updateSelectedImageFile(image: FirebaseImg) {
    if (image && image.url) {
      try {
        var scope = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function (event) {
          var blob: Blob = xhr.response;
          var b: any = blob;
          b.lastModifiedDate = new Date();
          b.name = "mainImage";
          scope.selectedImageFile = <File>blob;
        };
        xhr.open('GET', this.selectedImage.url);
        xhr.send();
      }
      catch (err) {
        this.selectedImageFile = undefined;
      }
    }
    else {
      this.selectedImageFile = undefined;
    }
  }

  saveSelectedImageAsMain() {
    try {
      this.infrastructure.mainImg = this.selectedImage;
      this.uploadMainImage();
      this.notifyUploadingMainImage()
      this.notifyClose();
    }

    catch (ex) { console.log(ex); }
  }

  uploadMainImage() {
    switch (this.selectionMode) {
      case "selection": {
        this.mainImageFile = this.selectedImageFile; break;
      }
      case "upload": {
        this.mainImageFile = this.uploadedImageFile; break;
      }
      default: this.mainImageFile = undefined;
    }

    if (this.infrastructure && this.infrastructure.$key && this.mainImageFile) {
      let newImage: FirebaseImg;
      const mainUploadTask: firebase.storage.UploadTask =
        this.storageRef.child('infrastructure/' + this.infrastructure.$key + '/mainImage/mainImage').put(this.mainImageFile);
      mainUploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
        },
        (error) => { this.notifyError("No se pudo realizar la selección de imagen principal."); },
        () => {
          let downloadURL: string = mainUploadTask.snapshot.downloadURL;
          var filepath: string = mainUploadTask.snapshot.metadata.fullPath;
          newImage = { fileName: "mainImage", url: downloadURL, filePath: filepath, description: 'Imagen Subida' };
          this.selectedImage = newImage;
          this.uploadThumbMainImage(newImage);
        }
      );
    }
  }
  uploadThumbMainImage(newImage: FirebaseImg) {
    var thumbnail;
    if (this.mainImageFile.size > 153600) {  //150KB
      thumbnail = this.createThumbImage(this.mainImageFile);
    }
    else {
      thumbnail = this.mainImageFile;
    }
    try {
      const thumbUploadTask: firebase.storage.UploadTask =
        this.storageRef.child('infrastructure/' + this.infrastructure.$key + '/mainImage/thumb-mainImage').put(thumbnail);
      thumbUploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
        },
        (error) => { this.notifyError("No se pudo realizar la selección de imagen principal."); },
        () => {
          let thumbnailUrl: string = thumbUploadTask.snapshot.downloadURL;
          var thumbnailPath: string = thumbUploadTask.snapshot.metadata.fullPath;

          newImage.thumbnailPath = thumbnailPath;
          newImage.thumbnailUrl = thumbnailUrl;
          this.updateMainImage(newImage);
        }
      );
    }
    catch (ex) {
      this.notifyError("No se pudo realizar la selección de imagen principal.");
    }
    
  }
  updateMainImage(newMainImge: FirebaseImg) {
    if (this.infrastructure && this.infrastructure.$key && newMainImge)
      try {
        this.angularFireService.updateMainImage(this.infrastructure.$key, newMainImge);
        this.notifyMainImageSaved();
      }
      catch (ex) {
        this.notifyError("No se pudo realizar la selección de imagen principal.");
      }
  }

  private createThumbImage(image: File) {
    ///CREAR THUMBNAIL
    return image;
  }


  removeMainImage() {

  }

  uploadFile(event, displayImageId: string) {
    let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    let files: FileList = target.files;
    this.uploadedImageFile = files[0];
    if (displayImageId && this.uploadedImageFile) {
      if (this.uploadedImageFile.type == 'image/jpeg' || this.uploadedImageFile.type == 'image/png') {
        var reader = new FileReader();
        reader.onload = (file: any) => {
          var displayImage = document.getElementById(displayImageId);
          if (displayImage) {
            displayImage.setAttribute("src", file.target.result);
          }
        }
        reader.readAsDataURL(this.uploadedImageFile);
      }
      else{
        this.uploadedImageFile=undefined;
        target.value="";
      }
    }
  }

  notifyClose() {
    this.onClose.emit(this.infrastructure);
  }

  notifyMainImageSaved() {
    this.onMainImageChanged.emit(this.selectedImage);
  }
  notifyUploadingMainImage() {
    this.onUploadingMainImage.emit(this.selectedImage);
  }

  private notifyError(msj: string) {
      this.onError.emit({title:"Error",content:msj});
  }

  close(){
    this.notifyClose();
    this.reset();
  }
  reset(){
   this.currentImage=null;
   this.indexString = "";
  
   this.selectedImageFile=null;  //Copia descargada de la imagen seleccionada;
   this.uploadedImageFile=null;  //Imagen subida
  
    this.mainImageFile=null;       //Imagen actual que será seleccionada. selectedImageFile || uploadedImageFile
  
    this.selectionMode = "upload";
    this.tabIndex = 0
    this.updateGallery();
    this.closeFullMode();
  
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }


  updateGallery() {
    this.emptyGallery = !(this.infrastructure && this.infrastructure.img && this.infrastructure.img.length > 0);
    if (!this.editMode) {
      this.selectedImage = undefined;
    }
    else {
      if (!this.selectedImage && this.infrastructure && this.infrastructure.img && this.infrastructure.mainImg) {
        this.infrastructure.img.forEach(image => {
          if (lodash.isEqual(image, this.infrastructure.mainImg)) {
            this.markAsSelected(image);
          }
        });
      }
    }
  }

  openFullMode() {
    this.updateGallery();
    if (!this.emptyGallery) {
      if (!this.currentImage) {
        this.selectedIndex = 0;
        this.currentImage = this.infrastructure.img[this.selectedIndex];
      }
      this.fullmode = true;
    }
    this.updateIndexString();
  }

  closeFullMode() {
    this.fullmode = false;
  }
  downloadImage() {

  }

  fullModeMoveLeft() {
    if (this.fullmode) {
      if (this.currentImage) {
        var len = this.infrastructure.img.length;
        this.selectedIndex = ((this.selectedIndex - 1) % len + len) % len;
        this.currentImage = this.infrastructure.img[this.selectedIndex];
        this.updateIndex();
      }
      else {
        this.selectedIndex = 0;
        this.indexString = "";
      }
    }

  }

  fullModeMoveRight() {
    if (this.fullmode) {
      if (this.currentImage) {
        this.selectedIndex = (this.selectedIndex + 1) % this.infrastructure.img.length;
        this.currentImage = this.infrastructure.img[this.selectedIndex];
        this.updateIndex();
      }
      else {
        this.selectedIndex = 0;
        this.indexString = "";
      }
    }

  }

  markAsCurrent(image) {
    this.currentImage = image;
    if (!this.editMode) {
      this.fullmode = true;
    }
    this.updateIndex();
  }

  markAsSelected(image) {
    this.selectedImage = image;
    this.markAsCurrent(image);
    if (this.selectedImage && this.infrastructure) {
      // this.infrastructure.mainImg = this.selectedImage;
      this.updateSelectedImageFile(this.selectedImage);
    }
  }

  updateIndex() {
    this.selectedIndex = this.currentImage ? this.infrastructure.img.lastIndexOf(this.currentImage) : 0;
    this.updateIndexString();
  }
  updateIndexString() {
    if (this.selectedIndex >= 0 && this.infrastructure && this.infrastructure.img) {
      this.indexString = (this.selectedIndex + 1) + "/" + this.infrastructure.img.length;
    }
    else {
      this.indexString = "";
    }
  }

  toggleImageSelectionMode() {
    this.selectionMode = "selection";
    this.tabIndex = 1;
  }

  toggleImageUploadMode() {
    this.selectionMode = "upload";
    this.tabIndex = 0;
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    var Enter = 13;
    var Esc = 27;
    var Right = 39;
    var left = 37;
    if (this.fullmode) {
      switch (event.keyCode) {
        case Esc: {
          this.closeFullMode();
          break;
        }
        case Right: {
          this.fullModeMoveRight();
          break;
        }
        case left: {
          this.fullModeMoveLeft();
          break;
        }
        default: break
      }
    }
  }
  

	popSuccessToast(pMesage: string) {
		var toast = {
			type: 'success',
			title: pMesage
		};
		this.toasterService.pop(toast);
	}

	popInfoToast(pMesage: string) {
		var toast = {
			type: 'info',
			title: pMesage
		};
		this.toasterService.pop(toast);
	}


	popErrorToast(pMessage: string) {
		var toast = {
			type: 'error',
			title: pMessage
		};
		this.toasterService.pop(toast);
	}

}