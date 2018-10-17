import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { AngularFireService } from '../../common/service/angularFire.service';
import {AngularFireDatabase} from 'angularfire2/database';
import { MapGoogleService } from '../map-google/map-google.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import {Location} from '@angular/common';


declare var $: any;

@Component({
  selector: 'app-toma-datos-infra',
  templateUrl: './toma-datos-infra.component.html',
  styleUrls: ['./toma-datos-infra.component.scss'],
  providers: [AngularFireService,ToasterService,MapGoogleService]
})
export class TomaDatosInfraComponent implements OnInit {
  private id: string;



  tomaDatosList: any[] = [];
  infraestructureList: any[] = [];
  infraFiltered: any[] = [];
  nameAsada: string;
  formReady: boolean = false;
  //tomaDatos: TomaDatos;

  /*			Toast variables		*/
  public toastConfig: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-bottom-center',
    limit: 5
  });

  constructor( private _Activatedroute:ActivatedRoute,
     db: AngularFireDatabase,
     private router: Router,
     private toasterService: ToasterService,
     private mapService: MapGoogleService,
     private angularFireService: AngularFireService,
     private _location: Location  ) {

    

    this.id=this._Activatedroute.snapshot.params['id'];
    db.list('/tomaDatos')
    .subscribe(tomaDatosList => {
      this.tomaDatosList = tomaDatosList;
      this.getInfraestructures();
    });

   
   }


  ngOnInit() {
    
  }

  setInfraOfTomaDatos(){
    for(let tomaDatos of this.tomaDatosList){
      
      if(tomaDatos.$key == this.id){
        this.nameAsada = tomaDatos.nameAsada;
        
        for(let infra of tomaDatos.infraestructuras){
          this.checkInfra(infra.id);
        }
      }
    }
  }

  checkInfra(id){
    //this.infraFiltered = [];
    for(let infra of this.infraestructureList){
      if(infra.$key == id){

        this.infraFiltered.push(infra);
      }
    }
  }

  getInfraestructures(): void {
    this.mapService.getInfrastructures()
        .subscribe(
            results => {
                this.infraestructureList = results;
                this.setInfraOfTomaDatos();
              
            }
        );

  }

checkEvaluationComplete(){
  for (let toma of this.tomaDatosList){
    for (let answer of toma.infraestructuras){
      if (answer.estado == 'Pendiente'){
        this.popErrorToast("Faltan formularios por completar.");
        
        return false;
      }
    }
  }
  $('#confirmSendModal').modal('show');
  return true;
}


deleteTomaDatos(){
  this.angularFireService.deleteTomaDatos(this.id);
  this._location.back();
}

popErrorToast(pMessage: string) {
  var toast = {
    type: 'error',
    title: pMessage
  };
  this.toasterService.pop(toast);


}

evaluate(elem: any): void {

  this.router.navigate(['/evalSERSA', elem.type, this.id, elem.$key]);
}

}
