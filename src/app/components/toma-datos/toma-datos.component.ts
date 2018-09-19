import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { AngularFireService } from '../../common/service/angularFire.service';
import { TomaDatos } from '../../common/model/TomaDatos';
import { FirebaseAuthState } from 'angularfire2/index';
import { DatePipe } from '@angular/common';
import { Infrastructure } from '../../common/model/Infrastructure';
import { MapGoogleService } from '../map-google/map-google.service';
@Component({
  selector: 'app-toma-datos',
  templateUrl: './toma-datos.component.html',
  styleUrls: ['./toma-datos.component.scss'],
  providers: [AngularFireService,DatePipe,MapGoogleService]
})
export class TomaDatosComponent implements OnInit {

  private infraestructureList: Infrastructure[];
  filteredList2: any[];
  asadaSelected: string = '';
  todayDate: Date;
  filteredList: any[];
  
  public cantidadTanques = 0;
  public cantidadCaptaciones = 0;
  public cantidadCloracion = 0;

  constructor(private mapService: MapGoogleService, db: AngularFireDatabase, private af: AngularFire,private angularFireService: AngularFireService,private datepipe: DatePipe) {
    this.infraestructureList = [];
    db.list('asadas')
    .subscribe(filteredList2 => {
      this.filteredList2 = filteredList2;
      this.getInfraestructures();
      
      });

   
    db.list('/tomaDatos')
    .subscribe(filteredList => {
      this.filteredList = filteredList;
      var tomaDatosList = new Array();
      for (var i = 0; i < this.filteredList.length; i++){
        var toma_datos = {
          'key':'',
          'id':'',
          'Asada': '',
          'Fecha': '',
          'Estado': '',
          'Infraestructura': ''
        }
        if(this.filteredList[i]["idEstudiante"] == this.User){
          toma_datos.key = this.filteredList[i]["$key"];  
          toma_datos.id = this.filteredList[i]["idToma"]; 
          toma_datos.Asada = this.filteredList[i]["nameAsada"];
          toma_datos.Fecha = this.filteredList[i]["dateCreated"];
          toma_datos.Estado = this.filteredList[i]["status"];
          toma_datos.Infraestructura = '3';
          tomaDatosList.push(toma_datos);

        }

      }
      
      this.filteredList = tomaDatosList;
      
    });
    

   }

   calculateInfraestructure(){
    console.log(this.infraestructureList.length);
     for(let tomaDatosEl of this.filteredList){
      
     for (let asada of this.filteredList2){
      
       if(tomaDatosEl.Asada == asada.name){
        var key;
        key = asada.$key;
        this.evalCantCaptacion(key);
        this.evalCantSistemasClr(key);
        this.evalCantTanques(key);
        tomaDatosEl.Infraestructura = this.cantidadCaptaciones + this.cantidadCloracion + this.cantidadTanques;
        }  
     }
   }
  }

   

   getInfraestructures(): void {
    this.mapService.getInfrastructures()
        .subscribe(
            results => {
                this.infraestructureList = results;
                
                this.calculateInfraestructure();
            }
        );
    
}

   private User = '';

   user: FirebaseAuthState;


  ngOnInit() {
      this.af.auth.subscribe(user => {

      this.user = user;
      this.User = this.user.uid;
      
    });}

 

  asadaHandler(event: any){
    this.asadaSelected = event.target.value;
  }



  addNewTomaDatos(pTomaDatos){
    this.angularFireService.addNewTomaDatos(pTomaDatos);
  }

  create(){
    
    var id = Number(this.filteredList[this.filteredList.length-1]["id"])+1;
    
    const tomaDatos: TomaDatos = new TomaDatos();
    this.todayDate = new Date();
    let latest_date =this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');

    tomaDatos.dateCreated = latest_date;
    tomaDatos.idToma= id.toString();
    tomaDatos.nameAsada = this.asadaSelected;
    tomaDatos.status = 'Pendiente';
    tomaDatos.idEstudiante = this.User;

    this.addNewTomaDatos(tomaDatos);
  }


  evalCantTanques(asadaid: string) {

    this.cantidadTanques = 0;
    for (let entry of this.infraestructureList) {
        if (entry.asada.id == asadaid && entry.type == "Tanque") {
            this.cantidadTanques = this.cantidadTanques + 1;
        }

    }
}

evalCantCaptacion(asadaid: string) {

    this.cantidadCaptaciones = 0;
    for (let entry of this.infraestructureList) {
        if (entry.asada.id == asadaid && (entry.type == "CaptacionNaciente" || entry.type == "CaptacionSuperficial")) {
            this.cantidadCaptaciones = this.cantidadCaptaciones + 1;
        }

    }
}

evalCantSistemasClr(asadaid: string) {

    this.cantidadCloracion = 0;
    for (let entry of this.infraestructureList) {
        if (entry.asada.id == asadaid && entry.type == "SistemaCloracion") {
            this.cantidadCloracion = this.cantidadCloracion + 1;
        }

    }
}



  

}
