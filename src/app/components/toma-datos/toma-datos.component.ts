import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

import { FirebaseAuthState } from 'angularfire2/index';

@Component({
  selector: 'app-toma-datos',
  templateUrl: './toma-datos.component.html',
  styleUrls: ['./toma-datos.component.scss']
})
export class TomaDatosComponent implements OnInit {

  filteredList2: any[];

  constructor(db: AngularFireDatabase, private af: AngularFire) {

    db.list('asadas')
    .subscribe(filteredList2 => {
      this.filteredList2 = filteredList2;
      
      console.log(this.filteredList2);
    });


   }

  ngOnInit() {
  }

}
