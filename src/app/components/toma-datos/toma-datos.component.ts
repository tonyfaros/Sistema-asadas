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

  constructor(db: AngularFireDatabase, private af: AngularFire,private angularFireService: AngularFireService,private datepipe: DatePipe) {

    db.list('asadas')
    .subscribe(filteredList2 => {
      this.filteredList2 = filteredList2;
      
      console.log(this.filteredList2);
      
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
