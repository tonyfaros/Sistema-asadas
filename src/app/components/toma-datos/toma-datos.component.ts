import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { AngularFireService } from '../../common/service/angularFire.service';
import { TomaDatos } from '../../common/model/TomaDatos';
import { FirebaseAuthState } from 'angularfire2/index';
import { DatePipe } from '@angular/common';
import { Infrastructure } from '../../common/model/Infrastructure';
import { MapGoogleService } from '../map-google/map-google.service';
import { LegendEntryComponent } from '@swimlane/ngx-charts';
import { TomaInfra } from '../../common/model/TomaInfra';
@Component({
  selector: 'app-toma-datos',
  templateUrl: './toma-datos.component.html',
  styleUrls: ['./toma-datos.component.scss'],
  providers: [AngularFireService,DatePipe,MapGoogleService]
})
export class TomaDatosComponent implements OnInit {

  private infraestructureList: Infrastructure[];
  asadasList: any[];
  asadaSelected: string = '';
  todayDate: Date;
  tomaDatosList: any[];
  
  
  public cantidadTanques = 0;
  public cantidadCaptaciones = 0;
  public cantidadCloracion = 0;

  constructor(private mapService: MapGoogleService, db: AngularFireDatabase, private af: AngularFire,private angularFireService: AngularFireService,private datepipe: DatePipe) {
    this.infraestructureList = [];
    db.list('asadas')
    .subscribe(asadasList => {
      this.asadasList = asadasList;
      this.getInfraestructures();
      
      });

   
    db.list('/tomaDatos')
    .subscribe(tomaDatosList => {
      this.tomaDatosList = tomaDatosList;
      var tomaDatosList = new Array();
      for (var i = 0; i < this.tomaDatosList.length; i++){
        var toma_datos = {
          'key':'',
          'id':'',
          'Asada': '',
          'Fecha': '',
          'Estado': '',
          'Infraestructura': ''
        }
        if(this.tomaDatosList[i]["idEstudiante"] == this.User){
          toma_datos.key = this.tomaDatosList[i]["$key"];  
          toma_datos.id = this.tomaDatosList[i]["idToma"]; 
          toma_datos.Asada = this.tomaDatosList[i]["nameAsada"];
          toma_datos.Fecha = this.tomaDatosList[i]["dateCreated"];
          toma_datos.Estado = this.tomaDatosList[i]["status"];
          tomaDatosList.push(toma_datos);

        }

      }
      
      this.tomaDatosList = tomaDatosList;
      
    });

   }

   calculateInfraestructure(){
    console.log(this.infraestructureList.length);
    for(let tomaDatosEl of this.tomaDatosList){
    
    for (let asada of this.asadasList){
    
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
    
    var id = Number(this.tomaDatosList[this.tomaDatosList.length-1]["id"])+1;
    
    const tomaDatos: TomaDatos = new TomaDatos();
    this.todayDate = new Date();
    let latest_date =this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');

    tomaDatos.dateCreated = latest_date;
    tomaDatos.idToma= id.toString();
    tomaDatos.nameAsada = this.asadaSelected;
    tomaDatos.status = 'Pendiente';
    tomaDatos.idEstudiante = this.User;
    tomaDatos.infraestructuras = this.returnInfraesOfAsada(this.asadaSelected);

    this.addNewTomaDatos(tomaDatos);
  }

  

  returnInfraesOfAsada(id: string){
    var listInfra: TomaInfra[] = [];
    for (let infra of this.infraestructureList){
      
      var infraTemp = new TomaInfra();

      if (infra.asada.name === id){
        
        infraTemp.id = infra.$key;
        listInfra.push(infraTemp);
      }
    }
    return listInfra;
    
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
