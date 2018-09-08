import { Component, OnInit,EventEmitter, Output } from '@angular/core';
import {LocationsService, locaciones, location} from  "app/common/service/locations.service";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [LocationsService]
})
  export class FilterComponent implements OnInit {

    private locaciones:locaciones;
    private categorias:string[];
    private riesgos:string[];

    public filterConfiguration:filterParams;
    constructor(private LocServ: LocationsService){}

    @Output() notify: EventEmitter<filterParams> = new EventEmitter<filterParams>();
    
    ngOnInit() {
      this.updateLocations();
    }

    updateLocations(){
      this.locaciones=this.LocServ.getLocations();
      this.locaciones=this.LocServ.activateLocations(this.locaciones);
    }

    filterCheckboxChange(event,loc:location) {
      try{
        loc.active=event.target.checked;
      }catch(ex){
        loc.active=true;
        event.target.checked=true;
      }
      this.notifyChange();
    }

    generateFilterConfiguration(){
      this.filterConfiguration={};
      this.filterConfiguration.locaciones=this.locaciones;
      this.filterConfiguration.categoras=this.categorias;
      this.filterConfiguration.riesgos=this.riesgos;
    }

    notifyChange(){
      this.generateFilterConfiguration();
      this.notify.emit(this.filterConfiguration);
    }

  }
  
  export interface filterParams{
    locaciones?:locaciones;
    riesgos?:string[];
    categoras?:string[]; 
  }