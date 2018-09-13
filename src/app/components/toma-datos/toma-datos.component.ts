import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { AngularFireService } from '../../common/service/angularFire.service';
import { TomaDatos } from '../../common/model/TomaDatos';
import { FirebaseAuthState } from 'angularfire2/index';
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-toma-datos',
  templateUrl: './toma-datos.component.html',
  styleUrls: ['./toma-datos.component.scss'],
  providers: [AngularFireService,DatePipe]
})
export class TomaDatosComponent implements OnInit {

  filteredList2: any[];
  asadaSelected: string = '';
  todayDate: Date;
  filteredList: any[];

  constructor(db: AngularFireDatabase, private af: AngularFire,private angularFireService: AngularFireService,private datepipe: DatePipe) {
    this.filteredList = [];
    db.list('asadas')
    .subscribe(filteredList2 => {
      this.filteredList2 = filteredList2;
      });

    var tomaDatosList = new Array();
    db.list('tomaDatos')
    .subscribe(filteredList => {
      this.filteredList = filteredList;
      
      //console.log(this.filteredList2);
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
          toma_datos.Infraestructura = "3";
  
          tomaDatosList.push(toma_datos);
          console.log(toma_datos);
        }
          
        
      }
      this.filteredList = tomaDatosList;

      
    });


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


}
