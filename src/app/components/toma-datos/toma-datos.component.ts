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
    var tomaDatosList = new Array();
    db.list('tomaDatos')
    .subscribe(filteredList2 => {
      this.filteredList2 = filteredList2;
      
      //console.log(this.filteredList2);
      for (var i = 0; i < this.filteredList2.length; i++){
        var toma_datos = {
          'key':'',
          'id':'',
          'Asada': '',
          'Fecha': '',
          'Estado': '',
          'Infraestructura': ''
        }
        while(this.filteredList2[i]["usuario"] != this.User){
          toma_datos.key = this.filteredList2[i]["$key"];  
          toma_datos.id = this.filteredList2[i]["id"]; 
          toma_datos.Asada = this.filteredList2[i]["Asada"];
          toma_datos.Fecha = this.filteredList2[i]["Fecha"];
          toma_datos.Estado = this.filteredList2[i]["estado"];
          toma_datos.Infraestructura = "3";
  
          tomaDatosList.push(toma_datos);
          //console.log(usuarios);
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

    const tomaDatos: TomaDatos = new TomaDatos();
    this.todayDate = new Date();
    let latest_date =this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');

    tomaDatos.dateCreated = latest_date;
    tomaDatos.idToma= '3';
    tomaDatos.nameAsada = this.asadaSelected;
    tomaDatos.status = 'Indefinido';
    tomaDatos.idEstudiante = this.User;

    this.addNewTomaDatos(tomaDatos);



  }

  /**
   * 
   */

}
