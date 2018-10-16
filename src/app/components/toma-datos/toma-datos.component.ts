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
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private mapService: MapGoogleService, private router: Router, db: AngularFireDatabase, private af: AngularFire,private angularFireService: AngularFireService,private datepipe: DatePipe) {
    this.infraestructureList = [];
    
    db.list('asadas')
    .subscribe(asadasList => {
      this.asadasList = asadasList;
      
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
          if(this.tomaDatosList[i]["infraestructuras"])
            toma_datos.Infraestructura = this.tomaDatosList[i]["infraestructuras"].length;
          else{
            toma_datos.Infraestructura="0";
          }
          tomaDatosList.push(toma_datos);

        }
      }
      
      this.tomaDatosList = tomaDatosList;
      
    });

    

   }

   openInfraList(elem){
     console.log("yes");
    this.router.navigate(['/tomaDatosInfra',elem]);
   }

   private User = '';

   user: FirebaseAuthState;

  cList: Array<any>;

  ngOnInit() {
      this.af.auth.subscribe(user => {

      this.user = user;
      this.User = this.user.uid;
      
     // this.data.currentList.subscribe(cList => this.cList = cList);
     // this.data.currentList.subscribe(listParm => this.infraestructureList)
    });}

 

  asadaHandler(event: any){
    this.asadaSelected = event.target.value;
  }



  addNewTomaDatos(pTomaDatos){
    this.angularFireService.addNewTomaDatos(pTomaDatos);
  }

  create(){
    var id = 0;

    if(this.tomaDatosList[this.tomaDatosList.length-1] != null){
       id = Number(this.tomaDatosList[this.tomaDatosList.length-1]["id"])+1;
    }

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

  

}
