

import { Component, DoCheck, EventEmitter, ViewChild, HostListener, Inject, Input, OnInit, Output } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { FirebaseApp } from 'angularfire2';
import { FirebaseImg } from 'app/common/model/FirebaseImg';
import { TomaInfra } from 'app/common/model/TomaInfra';



import { Infrastructure } from 'app/common/model/Infrastructure';


import * as firebase from 'firebase';
import { AngularFireService } from '../../../common/service/angularFire.service';
import { promise } from 'selenium-webdriver';
import { reject } from 'q';
import { TomaDatos } from '../../../common/model/TomaDatos';

const moment = require('moment');

const MAX_IMAGE_SIZE: number = 1572864;
const MAX_THUMBNAIL_SIZE: number = 153600;
const MAX_UPLOADED_AMOUNT: number = 2;
const MAX_TOTAL_IMAGES: number = 2;

@Component({
  selector: 'app-evidence-gallery',
  templateUrl: './evidence-gallery.component.html',
  styleUrls: ['./evidence-gallery.component.scss'],
  providers: [AngularFireService, ToasterService]
})

export class EvidenceGalleryComponent implements OnInit, DoCheck {

  public fullmode: boolean = false;

  public emptyGallery: boolean = true;

  public selectedElements: any[] = [];

  public currentImage: any;
  public selectedIndex: number;
  public indexString: string = "";

  private removedEvidenceImages: FirebaseImg[] = [];
  private starterEvidences: FirebaseImg[] = [];
  private newEvidenceImages: imagePack[] = [];


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

  @Output() onReady: EventEmitter<EvidenceGalleryComponent> = new EventEmitter<EvidenceGalleryComponent>();
  @Output() onImageAdded: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();
  @Output() onImageRemoved: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();
  @Output() onImagesUploaded: EventEmitter<FirebaseImg[]> = new EventEmitter<FirebaseImg[]>();
  @Output() onEvidencesUpdated: EventEmitter<TomaInfra> = new EventEmitter<TomaInfra>();
  @Output() onClose: EventEmitter<TomaInfra> = new EventEmitter<TomaInfra>();
  @Output() onError: EventEmitter<{ title: string, content: string }> = new EventEmitter<{ title: string, content: string }>();

  @Input() public evaluation: TomaInfra;
  @Input() public tomaDatos: TomaDatos;
  // @Input() public infrastructure: Infrastructure;
  @Input() editMode: boolean = false;


  ngOnInit() {
    this.updateGallery();
    this.onReady.emit(this);
  }

  private evindenceSettedFlag = false;
  ngDoCheck() {
    if (this.evaluation && !this.evindenceSettedFlag) {
      this.evindenceSettedFlag = true;
      this.setInitData();
    }
    this.updateGallery();
  }
  setInitData() {
    if (!this.evaluation.evidences){
      this.evaluation.evidences = [];
    }
    this.starterEvidences = this.evaluation.evidences;
  }

  addNewFile() {
    if (!this.evaluation.evidences)
      this.evaluation.evidences = [];
    if ((this.newEvidenceImages.length + this.evaluation.evidences.length) < MAX_TOTAL_IMAGES) {
      if (this.fileInput) {
        this.fileInput.nativeElement.click();
      }
    }
    else {
      this.popErrorToast("Se ha alcanzado el limite de imagenes disponibles")
    }
  }

  uploadNewEvidence(event) {

    if (this.newEvidenceImages.length + this.evaluation.evidences.length <= MAX_TOTAL_IMAGES) {

      let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
      let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
      let files: FileList = target.files;
      var uploadedImageFile = files[0];

      if (/* displayImageId && parentElementId && */ uploadedImageFile) {
        if (uploadedImageFile.type == 'image/jpeg' || uploadedImageFile.type == 'image/png') {
          try {
            this.loadingState = true;
            this.restrictImageToMaxSize(uploadedImageFile).then(file => {
              uploadedImageFile = file;

              this.loadingState = false;
            });
            var tempImageKey = this.evaluation.id ?
              (this.evaluation.id + "-" + Date.now() + "" + (uploadedImageFile.size % 10)) :
              (uploadedImageFile.name + "-" + Date.now() + "" + (uploadedImageFile.size % 10));

            var filePath = "infrastructure/" + this.evaluation.id + "/evidence/" + tempImageKey;

            var image: imagePack = {
              tempImageKey: tempImageKey,
              file: uploadedImageFile,
              image: {
                fileName: uploadedImageFile.name, filePath: filePath, url: "",
                imageKey: tempImageKey,
                description: "Evidencia de evaluación (" + moment().format('DD MMM, YYYY') + ")"
              }
            }

            this.newEvidenceImages.push(image);
            // console.table(this.newEvidenceImages);

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
    else {
      this.popErrorToast("Se ha alcanzado el limite de imagenes disponibles")
    }
  }
  updateUploadedImagesView() {
    for (let i = 0; i < this.newEvidenceImages.length; i++) {
      if (this.newEvidenceImages[i] && this.newEvidenceImages[i].file) {
        this.setImageSource(this.newEvidenceImages[i].tempImageKey, this.newEvidenceImages[i].file);

        // console.log(this.newEvidenceImages[i].file);
      }
    }
  }

  removeSelected() {
    this.selectedElements.forEach(img => {
      if (this.newEvidenceImages.includes(img)) {
        let tempNewImages = this.newEvidenceImages.filter(newImg => newImg != img)
        this.newEvidenceImages = tempNewImages;
      }
      else {
        if (this.evaluation.evidences.includes(img)) {

          this.removedEvidenceImages.push(img);
          let tempEvidences = this.evaluation.evidences.filter(evid => evid != img);
          this.evaluation.evidences = tempEvidences;
          this.updateUploadedImagesView();
        }
      }
    });
    // console.table("removeSelected", this.removedEvidenceImages);
    this.selectedElements = [];
  }
  public saveEvidenceChanges() {
    this.loadingState = true;
    return new Promise<TomaInfra>((resolve, reject) => {
      this.uploadEvindences().then(result => {
        this.selectedElements = [];
        this.newEvidenceImages = [];
        this.removedEvidenceImages = [];
        this.updateUploadedImagesView();
        var idEvaluation: number = this.getEvaluationId();
        if (idEvaluation >= 0) {
          
          this.loadingState = true;
          this.angularFireService.updateEvaluationEvidences(this.tomaDatos.$key, idEvaluation, this.evaluation, this.evaluation.evidences).subscribe(
            results => {
              console.table(this.evaluation.evidences);
              this.onEvidencesUpdated.emit(this.evaluation);
              resolve(this.evaluation);
              this.setInitData();
              this.loadingState = false;
            });
        }
        else {
          resolve(this.evaluation);
          this.loadingState = false;
        }
      });
    });
  }
  show() {
    console.log("-------------------------------------------\n\n");
    console.log("evidencias"); console.table(this.evaluation.evidences);
    console.log("selected"); console.table(this.selectedElements);
    console.log("removed"); console.table(this.removedEvidenceImages);
    console.log("newEvidenceImages"); console.table(this.newEvidenceImages);
    console.log("files"); console.table(this.fileInput.FileList);
  }
  //

  private uploadEvindences() {
    return new Promise<TomaInfra>((resolve, reject) => {
      if (this.evaluation && this.tomaDatos) {
        if (this.removedEvidenceImages) {
          // console.table("removed", this.removedEvidenceImages);
          this.removedEvidenceImages.forEach(img => {
            try {
              const thumbUploadTask: firebase.storage.UploadTask =
                this.storageRef.child(img.filePath).delete().then(function () {
                  // console.log("erased");
                }).catch(function (error) {
                  // console.log("failed", error);

                });
            }
            catch (ex) {
            }
          });
          this.removedEvidenceImages = [];
        }

        if (this.newEvidenceImages && this.newEvidenceImages.length > 0) {
          for (let i = 0; i < this.newEvidenceImages.length; i++) {
            var completedAmount = 0;
            let img = this.newEvidenceImages[i];
            if (img.file && img.image && img.tempImageKey) {
              try {
                const imageUploadTask: firebase.storage.UploadTask =
                  this.storageRef.child(img.image.filePath).put(img.file);
                imageUploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                  (snapshot) => {
                  },
                  (error) => {
                    this.notifyError("No se pudo guardar la imagen"); this.loadingState = false;
                  },
                  () => {
                    let downloadURL: string = imageUploadTask.snapshot.downloadURL;
                    img.image.url = downloadURL;
                    this.evaluation.evidences.push(img.image);
                    // console.log(img.image.fileName);
                    completedAmount = completedAmount + 1;

                    if (completedAmount == this.newEvidenceImages.length) {
                      this.notifyAllImagesUploaded();
                      resolve(this.evaluation);

                    }
                  }
                );
              }
              catch (ex) {
                this.notifyError("No se pudo realizar la selección de imagen principal.");
                reject();
                this.loadingState = false;
              }
            }
          }
        }
        else {
          resolve(this.evaluation);
          this.loadingState = false;
        }
      }
      else {
        reject();
        this.loadingState = false;
      }

    });

  }
  getEvaluationId(): number {
    for (var i = 0; i < (this.tomaDatos.infraestructuras).length; i++) {
      if (this.tomaDatos.infraestructuras[i]['id'] == this.evaluation.id) {
        return i;
      }
    }
    return -1;
  }


  reset() {
    this.loadingState = true;
    this.selectedElements = [];
    this.newEvidenceImages = [];
    this.updateUploadedImagesView();
    if (this.evaluation && this.starterEvidences) {
      this.evaluation.evidences = this.starterEvidences;
    }

    this.currentImage = null;
    this.indexString = "";

    this.updateGallery();
    this.closeFullMode();
    this.loadingState = false;

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
  notifyAllImagesUploaded() {
    this.onImagesUploaded.emit(this.evaluation.evidences);
  }
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

  toggleEdit() {
    this.loadingState = false;
    this.editMode = !this.editMode;
  }

  updateGallery() {
    this.emptyGallery = !((this.evaluation
      && this.evaluation.evidences
      && this.evaluation.evidences.length > 0) ||
      (this.newEvidenceImages
        && this.newEvidenceImages.length > 0));
    // if (this.editMode) {
    //   this.updateUploadedImagesView();
    // }
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
    if (image) {
      if (!this.selectedElements.includes(image)) {
        this.selectedElements.push(image);
      }
      else {
        var temporal = this.selectedElements.filter(elem => elem != image);
        this.selectedElements = temporal;
      }
    }
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