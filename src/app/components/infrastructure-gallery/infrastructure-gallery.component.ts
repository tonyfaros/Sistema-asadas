import { Component, OnInit,Output, DoCheck, Input, HostListener, EventEmitter } from '@angular/core';
import {Infrastructure} from 'app/common/model/Infrastructure';
import {FirebaseImg} from 'app/common/model/FirebaseImg';


@Component({
  selector: 'app-infrastructure-gallery',
  templateUrl: './infrastructure-gallery.component.html',
  styleUrls: ['./infrastructure-gallery.component.scss']
})
export class InfrastructureGalleryComponent implements OnInit,DoCheck {

  private fullmode:boolean=false;

  private emptyGallery:boolean=true;
  private selectedImage:FirebaseImg;
  private currentImage:FirebaseImg;
  private selectedIndex:number;
  private indexString:string="";

  constructor() {
    this.indexString=".";
    this.selectedIndex=0;
  }
  
  @Output() selectedImageChanged: EventEmitter<Infrastructure> = new EventEmitter<Infrastructure>();
  @Input() public infrastructure: Infrastructure ;
  @Input() editMode:boolean=false;


  
  ngOnInit() {
    this.updateGallery();
  }

  notifyChange() {
    this.selectedImageChanged.emit(this.infrastructure);
    console.log(this.infrastructure);
  }

  toggleEdit(){
    this.editMode=!this.editMode;
  }
  
  ngDoCheck(){
    this.updateGallery();
  }

  infrastructureChanged(){

  }

  imagesChanged(){

  }

  updateGallery(){
    this.emptyGallery=!(this.infrastructure && this.infrastructure.img && this.infrastructure.img.length>0);
    if(!this.editMode){
      this.selectedImage=undefined;
    }
  }
  openFullMode(){
    this.updateGallery();
    if(!this.emptyGallery){
      if(!this.currentImage){
        this.selectedIndex=0;
        this.currentImage=this.infrastructure.img[this.selectedIndex];
      }
      this.fullmode=true;
    }
    this.updateIndexString();
  }

  closeFullMode(){
    this.fullmode=false;
  }
  downloadImage(){

  }

  fullModeMoveLeft(){
      if(this.fullmode){
          if(this.currentImage){
            var len=this.infrastructure.img.length;
            this.selectedIndex=((this.selectedIndex-1) % len + len) %len;
            this.currentImage=this.infrastructure.img[this.selectedIndex];
            this.updateIndex();
          }
          else{
            this.selectedIndex=0;
            this.indexString="";
          }
      }
      
    }

  fullModeMoveRight(){
    if(this.fullmode){
        if(this.currentImage){
          this.selectedIndex=(this.selectedIndex+1)%this.infrastructure.img.length;
          this.currentImage=this.infrastructure.img[this.selectedIndex];
          this.updateIndex();
        }
          else{
          this.selectedIndex=0;
          this.indexString="";
        }
    }
    
  }

  markAsCurrent(image){
    this.currentImage=image;
    if(!this.editMode){
      this.fullmode=true;
    }
    this.updateIndex();
  }
  
  markAsSelected(image){
    this.selectedImage=image;
    this.markAsCurrent(image);
    if(this.selectedImage && this.infrastructure){
      console.log("notified");
      this.infrastructure.mainImg=this.selectedImage;
      this.notifyChange();
    }
  }

  updateIndex(){
    this.selectedIndex=this.currentImage?this.infrastructure.img.lastIndexOf(this.currentImage):0;
    this.updateIndexString();
  }
  updateIndexString(){
    if(this.selectedIndex>=0 && this.infrastructure && this.infrastructure.img){
      this.indexString=(this.selectedIndex+1)+"/"+this.infrastructure.img.length;
    }
    else{
      this.indexString="";
    }
  }
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === "Escape" && this.fullmode) {
      this.closeFullMode()
    }
}

}