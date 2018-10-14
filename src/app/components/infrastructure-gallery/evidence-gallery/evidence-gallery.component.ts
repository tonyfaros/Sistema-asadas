

import { Component, DoCheck, EventEmitter, HostListener, Inject, Input, OnInit, Output } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { FirebaseApp } from 'angularfire2';
import { FirebaseImg } from 'app/common/model/FirebaseImg';
import { TomaInfra } from 'app/common/model/TomaInfra';



import { Infrastructure } from 'app/common/model/Infrastructure';


import * as firebase from 'firebase';
import { AngularFireService } from '../../../common/service/angularFire.service';

const moment=require('moment');

const MAX_IMAGE_SIZE: number = 1572864;
const MAX_THUMBNAIL_SIZE: number = 153600;
const MAX_UPLOADED_AMOUNT:number=2;
const MAX_TOTAL_IMAGES:number=2;

@Component({
  selector: 'app-evidence-gallery',
  templateUrl: './evidence-gallery.component.html',
  styleUrls: ['./evidence-gallery.component.scss'],
  providers: [AngularFireService, ToasterService]
})
export class EvidenceGalleryComponent implements OnInit, DoCheck {

  public fullmode: boolean = false;

  public emptyGallery: boolean = true;
  public selectedImage: FirebaseImg;

  public currentImage: FirebaseImg;
  public selectedIndex: number;
  public indexString: string = "";

  private removedEvidenceImages: FirebaseImg[];
  private newEvidenceImages: imagePack[] = [];

  public loadingState: boolean = false;

  private storageRef;

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


  @Output() onImageAdded: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();
  @Output() onImageRemoved: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();
  @Output() onImagesUpdated: EventEmitter<FirebaseImg[]> = new EventEmitter<FirebaseImg[]>();
  @Output() onClose: EventEmitter<TomaInfra> = new EventEmitter<TomaInfra>();
  @Output() onError: EventEmitter<{ title: string, content: string }> = new EventEmitter<{ title: string, content: string }>();

  @Input() public evaluation: TomaInfra;
  @Input() public infrastructure: Infrastructure;
  @Input() editMode: boolean = false;


  ngOnInit() {
    this.evaluation={id:"",res1:"",res2:"",res3:"",res4:"",res5:"",res6:"",res7:"",res8:"",res9:"",res10:"",
    evidences:[]}
    this.updateGallery();
  }

  ngDoCheck() {
    if(this.infrastructure){
    this.evaluation.evidences=this.infrastructure.img;}
    this.updateGallery();
  }

  uploadNewEvidence(event, displayImageId: string,parentElementId:string) {
    let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    let files: FileList = target.files;
    var uploadedImageFile = files[0];
    if (displayImageId && parentElementId && uploadedImageFile) {
      if (uploadedImageFile.type == 'image/jpeg' || uploadedImageFile.type == 'image/png') {
        try {
          this.loadingState = true;
          this.restrictImageToMaxSize(uploadedImageFile).then(file => {
            uploadedImageFile = file;

            this.loadingState = false;
          });
          var tempImageKey=this.evaluation.id ? this.evaluation.id : (uploadedImageFile.name + "-" + Date.now())
          var image: imagePack = {
            tempImageKey: tempImageKey,
            file: uploadedImageFile,
            image: {
              fileName: uploadedImageFile.name, filePath: "", url: "",
              imageKey:tempImageKey,
              description: "Evidencia de evaluación ("+moment().format('DD MMM, YYYY')+")"
            }
          }
          
          this.newEvidenceImages.push(image);
          this.updateUploadedImagesView();
          
        } catch (err) {
          this.loadingState = false;
        }
      }
      else {
        target.value = "";
        this.loadingState = false;
      }
    }
  }
  updateUploadedImagesView(){
    for(let i=0;i<MAX_UPLOADED_AMOUNT;i++){
      if(this.newEvidenceImages[i] && this.newEvidenceImages[i].file){
        this.setImageSource("imageToUpload-"+i,this.newEvidenceImages[i].file);
      }
    }
  }

  removeImage() {

  }
  removeUploadedImage() {

    this.updateUploadedImagesView();
  }
  updateEvidences() {

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
    this.onClose.emit(this.evaluation);
  }

  notifyError(msj: string) {
    this.onError.emit({ title: "Error", content: msj });
    this.loadingState = false;
  }

  /*   Metodos de navegacion */
  close() {
    this.loadingState = false;
    this.notifyClose();
    this.reset();
  }
  reset() {
    this.loadingState = false;
    this.currentImage = null;
    this.indexString = "";

    this.updateGallery();
    this.closeFullMode();

  }

  toggleEdit() {
    this.loadingState = false;
    this.editMode = !this.editMode;
  }

  updateGallery() {
    this.emptyGallery = !(this.evaluation && this.evaluation.evidences && this.evaluation.evidences.length > 0);
    if (!this.editMode) {
      this.selectedImage = null;
    }
    else{
      this.updateUploadedImagesView();
    }
  }

  openFullMode() {
    this.updateGallery();
    if (!this.emptyGallery) {
      if (!this.currentImage) {
        this.selectedIndex = 0;
        this.currentImage = this.evaluation.evidences[this.selectedIndex];
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
        var len = this.evaluation.evidences.length;
        this.selectedIndex = ((this.selectedIndex - 1) % len + len) % len;
        this.currentImage = this.evaluation.evidences[this.selectedIndex];
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
        this.selectedIndex = (this.selectedIndex + 1) % this.evaluation.evidences.length;
        this.currentImage = this.evaluation.evidences[this.selectedIndex];
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
  }

  updateIndex() {
    this.selectedIndex = this.currentImage ? this.evaluation.evidences.lastIndexOf(this.currentImage) : 0;
    this.updateIndexString();
  }
  updateIndexString() {
    if (this.selectedIndex >= 0 && this.evaluation && this.evaluation.evidences) {
      this.indexString = (this.selectedIndex + 1) + "/" + this.evaluation.evidences.length;
    }
    else {
      this.indexString = "";
    }
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
interface imagePack {
  file?: File;
  image?: FirebaseImg;
  tempImageKey: String;
}