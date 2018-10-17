import { Component, DoCheck, EventEmitter,ViewChild, HostListener, Inject, Input, OnInit, Output } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { FirebaseApp } from 'angularfire2';
import { FirebaseImg } from 'app/common/model/FirebaseImg';
import { Infrastructure } from 'app/common/model/Infrastructure';
import * as firebase from 'firebase';
import { Chlorination } from '../../common/model/Chlorination';
import { AngularFireService } from '../../common/service/angularFire.service';

const MAX_IMAGE_SIZE: number = 1572864;
const MAX_THUMBNAIL_SIZE: number = 153600;


const lodash = require('lodash');
// const sharp = require('sharp');
// import { Ng2ImgMaxService } from 'ng2-img-max';

@Component({
  selector: 'app-infrastructure-gallery',
  templateUrl: './infrastructure-gallery.component.html',
  styleUrls: ['./infrastructure-gallery.component.scss'],
  providers: [AngularFireService, ToasterService]
})
export class InfrastructureGalleryComponent implements OnInit, DoCheck {

  public fullmode: boolean = false;

  public emptyGallery: boolean = true;
  public selectedImage: FirebaseImg;

  public currentImage: FirebaseImg;
  public selectedIndex: number;
  public indexString: string = "";


  private selectedImageFile: File;  //Copia descargada de la imagen seleccionada;
  private selectedThumbnailFile: File;  //Copia descargada de la imagen seleccionada  (thumbnail)
  private selectedImageKey:string;

  private uploadedImageFile: File;  //Imagen subida
  private uploadedThumbnailFile: File;  //Imagen subida (thumbnail)
  private uploadedImageKey:string;

  private mainImageFile: File;       //Imagen actual que será seleccionada. selectedImageFile || uploadedImageFile
  private mainThumbnailFile: File;

  public selectionMode: string = "upload";
  public tabIndex: number = 0

  public loadingState: boolean = false;

  private storageRef;

  @ViewChild('file') fileInput;
  constructor(
    @Inject(FirebaseApp) firebaseApp: any,
    private angularFireService: AngularFireService,
    private toasterService: ToasterService,
  ) {
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
  @Output() onError: EventEmitter<{ title: string, content: string }> = new EventEmitter<{ title: string, content: string }>();

  @Input() public infrastructure: Infrastructure;
  @Input() editMode: boolean = false;

  @Input() preview: boolean = true;

  ngOnInit() {
    this.updateGallery();
  }

  ngDoCheck() {
    this.updateGallery();
  }

  addNewFile() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }


  /**Inicia el proceso de guardado de la imagen SELECCIONADA
   * Se actualizan los datos segun la imagen seleccionada
   */
  saveSelectedImageAsMain() {
    try {
      this.infrastructure.mainImg = this.selectedImage;
      this.loadingState=true;
      if (this.uploadMainImage()) {
        this.notifyUploadingMainImage()
      }
      else {
        this.popErrorToast("Fallo obtener los datos requeridos");
        this.loadingState=false;
      }
    }

    catch (ex) { this.popErrorToast("Fallo obtener los datos requeridos");this.loadingState=false;  }
  }
  uploadMainImage() {
    var imageKey:string="";
    switch (this.selectionMode) {
      case "selection": {
        this.mainImageFile = this.selectedImageFile;
        this.mainThumbnailFile = this.selectedThumbnailFile;
        imageKey=this.selectedImageKey;
        break;
      }
      case "upload": {
        this.mainImageFile = this.uploadedImageFile;
        this.mainThumbnailFile = this.uploadedThumbnailFile;
        imageKey=this.uploadedImageKey;
        break;
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
          if(imageKey){newImage.imageKey=imageKey;}
          this.selectedImage = newImage;
          this.uploadThumbMainImage(newImage);
        }
      );
      return true;
    }
    else {
      return false;
    }
  }
  uploadThumbMainImage(newImage: FirebaseImg) {
    if (this.mainThumbnailFile) {
      try {
        const thumbUploadTask: firebase.storage.UploadTask =
          this.storageRef.child('infrastructure/' + this.infrastructure.$key + '/mainImage/thumb-mainImage').put(this.mainThumbnailFile);
        thumbUploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {
          },
          (error) => { this.notifyError("No se pudo realizar la selección de imagen principal."); this.loadingState=false;
        },
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
        this.loadingState=false;
      }
    }
    else {
      this.popErrorToast("Error al procesar la imagen");
      this.loadingState=false;
    }

  }
  updateMainImage(newMainImge: FirebaseImg) {
    if (this.infrastructure && this.infrastructure.$key && newMainImge){
      try {
        this.angularFireService.updateMainImage(this.infrastructure.$key, newMainImge);
        this.notifyMainImageSaved();
        this.reset();
        this.loadingState=false;
      }
      catch (ex) {
        this.loadingState=false;
        this.notifyError("No se pudo realizar la selección de imagen principal.");
      }
    }
    else{
      this.loadingState=false;
    }
  }
  removeMainImage() {

  }

  /**Descarga desde la BD la imagen seleccionada
   *-Permite obtener el archivo de imagen de forma anticipada, antes de realizar la actualizacion
   *-de la imagen principal
   * @param {FirebaseImg} image Imagen de referencia
   */
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
          scope.selectedImageKey=image.imageKey?image.imageKey:(scope.infrastructure.$key+"-"+Date.now());
          scope.updatePreviewImage();
          scope.createThumbImage(scope.selectedImageFile).then(file => {

            scope.selectedThumbnailFile = file;
          });
          scope.restrictImageToMaxSize(scope.selectedImageFile).then(file => {
            scope.selectedImageFile = file;
          });

          scope.loadingState = false;

        };
        this.loadingState = true;
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

  /**Carga desde almacenamiento local la imagen seleccionada
   *-Permite obtener el archivo de imagen de forma anticipada, antes de realizar la actualizacion
   *-de la imagen principal
   * @param {*} event
   * @param {string} displayImageId
   */
  updateUploadedImageFile(event, displayImageId: string) {

    let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    let files: FileList = target.files;
    if (displayImageId && files[0]) {
      this.uploadedImageFile = files[0];
      if (this.uploadedImageFile.type == 'image/jpeg' || this.uploadedImageFile.type == 'image/png') {
        try {
          this.loadingState = true;
          this.setImageSource(displayImageId, this.uploadedImageFile);
          this.updatePreviewImage();

          this.uploadedImageKey="uploaded"+this.infrastructure.$key+"-"+Date.now();
          this.createThumbImage(this.uploadedImageFile).then(file => {
            this.uploadedThumbnailFile = file;
          });

          this.restrictImageToMaxSize(this.uploadedImageFile).then(file => {
            this.uploadedImageFile = file;
          });


          this.loadingState = false;
        } catch (err) {
          this.loadingState = false;
          this.updatePreviewImage();
        }
      }
      else {
        this.uploadedThumbnailFile = undefined;
        this.uploadedImageFile = undefined;
        target.value = "";
        this.updatePreviewImage();
      }
    }
  }

  updatePreviewImage() {
    if (this.preview) {
      switch (this.selectionMode) {
        case "selection": {
          this.mainImageFile = this.selectedImageFile;
          this.mainThumbnailFile = this.selectedThumbnailFile; break;
        }
        case "upload": {
          this.mainImageFile = this.uploadedImageFile;
          this.mainThumbnailFile = this.uploadedThumbnailFile; break;
        }
        default: this.mainImageFile = null;
      }

    }
    else {
      this.mainImageFile = null;
      this.mainThumbnailFile = null;
    }
    if (this.mainImageFile) {
      this.setImageSource('preview-image', this.mainImageFile);
    }
  }
  setImageSource(displayedImageId, file: File) {
    var reader = new FileReader();
    reader.onload = (file: any) => {
      var displayImage = document.getElementById(displayedImageId);
      if (displayImage) {
        displayImage.setAttribute("src", file.target.result);
      }
    }
    reader.readAsDataURL(file);
  }

  restrictImageToMaxSize(image: File): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      if (image.size > MAX_IMAGE_SIZE) {  //150KB

        this.resizeImage(image, "image", 1500, 1500)
          .then(file => {
            if (file.size > MAX_IMAGE_SIZE) {  //150KB
              this.resizeImage(image, "image", 800, 600)
                .then(file => {
                  resolve(file);
                });
            }
            else {
              resolve(file);
            }
          });
      }
      else {
        resolve(image);
      }
    });
  }

  createThumbImage(image: File): Promise<File> {
    if (image.size > MAX_THUMBNAIL_SIZE) {  //150KB
      return this.resizeImage(image, "thumbImage", 150, 150);
    }
    else {
      return new Promise<File>((resolve, reject) => { resolve(image); });
    }
  }
  resizeImage(file: File, name: string, maxWidth: number, maxHeight: number): Promise<File> {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (width <= maxWidth && height <= maxHeight) {
          resolve(file);
        }

        let newWidth;
        let newHeight;

        if (width > height) {
          newHeight = height * (maxWidth / width);
          newWidth = maxWidth;
        } else {
          newWidth = width * (maxHeight / height);
          newHeight = maxHeight;
        }

        let canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        let context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, newWidth, newHeight);
        canvas.toBlob(blob => {
          let b: any = blob;
          b.lastModifiedDate = new Date();
          b.name = name;
          resolve(<File>b);
        },
          file.type);
      };
      image.onerror = reject;
    });
  }
  /*   Metodos de Notificacion */
  notifyClose() {
    this.onClose.emit(this.infrastructure);
  }
  notifyMainImageSaved() {
    this.onMainImageChanged.emit(this.selectedImage);
  }
  notifyUploadingMainImage() {
    this.onUploadingMainImage.emit(this.selectedImage);
  }

  notifyError(msj: string) {
    this.onError.emit({ title: "Error", content: msj });
    this.loadingState=false;
  }

  /*   Metodos de navegacion */
  close() {
    this.loadingState=false;
    this.notifyClose();
    this.reset();
  }
  reset() {
    this.loadingState=false;
    this.currentImage = null;
    this.indexString = "";

    this.selectedImageFile = null;  //Copia descargada de la imagen seleccionada;
    this.uploadedImageFile = null;  //Imagen subida
    
    this.selectedImageKey="";
    this.uploadedImageKey="";

    this.mainImageFile = null;       //Imagen actual que será seleccionada. selectedImageFile || uploadedImageFile

    this.selectionMode = "upload";
    this.tabIndex = 0
    this.updateGallery();
    this.closeFullMode();

  }

  toggleEdit() {
    this.loadingState=false;
    this.editMode = !this.editMode;
  }

  updateGallery() {
    this.emptyGallery = !(this.infrastructure && this.infrastructure.img && this.infrastructure.img.length > 0);
    if (!this.editMode) {
      this.selectedImage = null;
    }
    else {
      if (!this.selectedImage && this.infrastructure && this.infrastructure.img && this.infrastructure.mainImg) {
        this.infrastructure.img.forEach(image => {
          if(image.imageKey && this.infrastructure.mainImg.imageKey && image.imageKey==this.infrastructure.mainImg.imageKey){
          // if (lodash.isEqual(image, this.infrastructure.mainImg)) 
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
    this.updatePreviewImage();
  }

  toggleImageUploadMode() {
    this.selectionMode = "upload";
    this.tabIndex = 0;
    this.updatePreviewImage();
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