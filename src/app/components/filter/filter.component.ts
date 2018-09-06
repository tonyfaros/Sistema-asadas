import { Component, OnInit } from '@angular/core';
import {LocationsService, provincia, locaciones} from  "app/common/service/locations.service";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [LocationsService]
})
  export class FilterComponent implements OnInit {

    private locaciones:locaciones;
    constructor(private LocServ: LocationsService){}
  
    ngOnInit() {
      this.LocServ.prueba();
      //console.log(this.LocServ.getListDistritos(1,1));
      //console.log("JSON2: "+JSON.stringify(this.locaciones));
    }
  
  }