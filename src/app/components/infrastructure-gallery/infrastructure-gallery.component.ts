import { Component, OnInit, Output, DoCheck, Input, HostListener, EventEmitter } from '@angular/core';
import { Infrastructure } from 'app/common/model/Infrastructure';
import { FirebaseImg } from 'app/common/model/FirebaseImg';
import { Chlorination } from '../../common/model/Chlorination';

import { AngularFireService } from '../../common/service/angularFire.service';
const lodash=require('lodash');

@Component({
  selector: 'app-infrastructure-gallery',
  templateUrl: './infrastructure-gallery.component.html',
  styleUrls: ['./infrastructure-gallery.component.scss'],
  providers: [AngularFireService]
})
export class InfrastructureGalleryComponent implements OnInit, DoCheck {

  private fullmode: boolean = false;

  private emptyGallery: boolean = true;
  private selectedImage: FirebaseImg;
  private currentImage: FirebaseImg;
  private selectedIndex: number;
  private indexString: string = "";

  private tabIndex=0;


  constructor(
    private angularFireService: AngularFireService, ) {
    this.indexString = ".";
    this.selectedIndex = 0;
  }

  @Output() selectedImageChanged: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();
  @Output() cancel: EventEmitter<Infrastructure> = new EventEmitter<Infrastructure>();
  @Output() imageUplodaded: EventEmitter<FirebaseImg> = new EventEmitter<FirebaseImg>();

  @Input() public infrastructure: Chlorination;
  @Input() editMode: boolean = false;
  

  ngOnInit() {
    this.updateGallery();
  }

  saveSelectedImageAsMain() {
    try {
      if (this.infrastructure && this.infrastructure.$key && this.selectedImage) {
          this.angularFireService.updateMainImage(this.infrastructure.$key, this.selectedImage);
          this.notifyChange();
      }
    }
    catch (ex) { console.log(ex); }
  }
  ngDoCheck() {
    this.updateGallery();
  }

  saveUploadedImageAsMain() {

  }

  createThumbail() {

  }

  removeMainImage() {

  }
  
	uploadFile(event) {
		let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
		let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    let files: FileList = target.files;
    console.log(files);
		this.loadImage(files[0]);
	}
  
  loadImage(file){
    var reader = new FileReader();
    reader.onload = this.mageIsLoaded;
    reader.readAsDataURL(file);
  }
  private uploadedImageUrl:string;

  imageIsLoaded(event) {
    console.log(event.target.result);
    this.uploadedImageUrl=event.target.result;
  };

  notifyChange() {
    this.selectedImageChanged.emit(this.selectedImage);
  }

  notifyCancel(){
    this.cancel.emit(this.infrastructure);
  }

  notifyImageUploaded(){

  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }


  updateGallery() {
    this.emptyGallery = !(this.infrastructure && this.infrastructure.img && this.infrastructure.img.length > 0);
    if (!this.editMode) {
      this.selectedImage = undefined;
    }
    else{
      if(!this.selectedImage && this.infrastructure && this.infrastructure.mainImg){
        this.infrastructure.img.forEach(image=>{
            if(lodash.isEqual(image, this.infrastructure.mainImg)){
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
      this.infrastructure.mainImg = this.selectedImage;
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

  changeTabIndex(index:number){
    this.tabIndex=index;
  }
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    var Enter=13;
    var Esc=27;
    var Right=39;
    var left=37;
    if(this.fullmode){
      switch (event.keyCode){
        case Esc:{
          this.closeFullMode();
          break;
        }
        case Right:{
          this.fullModeMoveRight();
          break;
        }
        case left:{
          this.fullModeMoveLeft();
          break;
        }
        default:break
      }
    }
  }

}