import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { AngularFireService } from '../../common/service/angularFire.service';
import {AngularFireDatabase} from 'angularfire2/database';
import { MapGoogleService } from '../map-google/map-google.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import {Location} from '@angular/common';
import { TomaDatos } from '../../common/model/TomaDatos';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { FirebaseAuthState } from 'angularfire2/index';

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
  tomaAux: TomaDatos;
  rol;
  //tomaDatos: TomaDatos;

  /*			Toast variables		*/
  public toastConfig: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-bottom-center',
    limit: 5
  });

  constructor( private _Activatedroute:ActivatedRoute, 
    private af: AngularFire,
     db: AngularFireDatabase,
     private router: Router,
     private toasterService: ToasterService,
     private mapService: MapGoogleService,
     private angularFireService: AngularFireService,
     private _location: Location  ) {

    
    
    this.id=this._Activatedroute.snapshot.params['id'];
    this.angularFireService.getTomaDatos(this.id).subscribe(results => this.tomaAux=results);
    db.list('/tomaDatos')
    .subscribe(tomaDatosList => {
      this.tomaDatosList = tomaDatosList;
      this.infraFiltered = [];
      this.getInfraestructures();
    });

   
   }

  User = '';
  user: FirebaseAuthState;

  ngOnInit() {
    this.af.auth.subscribe(user => {

      this.user = user;
      this.User = this.user.uid;
      this.angularFireService.getUsuario(this.User).subscribe(result => this.rol = result.rol);
    });
  }

  setInfraOfTomaDatos(){
    
    for(let tomaDatos of this.tomaDatosList){
      
      if(tomaDatos.$key == this.id && tomaDatos.infraestructuras){
        this.nameAsada = tomaDatos.nameAsada;
        tomaDatos.infraestructuras
        for(let infra of tomaDatos.infraestructuras){
          this.checkInfra(infra.id);
        }
      }
    }
  }

  checkInfra(id){
    
    for(let infra of this.infraestructureList){
      if(infra.$key == id){

        this.infraFiltered.push(infra);
      }
    }
  }

  getInfraestructures(): void {
    this.infraFiltered = [];
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
    if(toma.$key == this.id){
      for (let answer of toma.infraestructuras){
        if (answer.estado === 'Pendiente'){
          this.popErrorToast("Faltan formularios por completar.");
          return false;
        }
      }
    }
  }
  $('#confirmSendModal').modal('show');
  return true;
}

sendEvaluation(){
  if(this.rol == "Estudiante"){
    this.angularFireService.updateStatusTomaDatos(this.id,'Pendiente');
    this._location.back();
  }
  else{
    this.angularFireService.updateStatusTomaDatos(this.id,'Aceptado');
    //this.angularFireService.uptadeRiesgoInfraestructura(this.tomaAux.$key,);
  }
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
