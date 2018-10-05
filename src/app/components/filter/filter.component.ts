import { Component, OnInit, EventEmitter, Output, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { LocationsService, locaciones, location, provincia, canton, distrito } from "app/common/service/locations.service";
export {  LocationsService, locaciones, location, provincia, canton, distrito } from "app/common/service/locations.service";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [LocationsService]
})
export class FilterComponent implements OnInit {

  private locaciones: locaciones;
  private categorias: filterParam[];
  private riesgos: filterParam[];
  private filterColSize=12;
  public filterConfiguration: filterConfig;


  constructor(private LocServ: LocationsService) {
  }

  @Output() notify: EventEmitter<filterConfig> = new EventEmitter<filterConfig>();
  @Input() activeLocationFilter: boolean = true;
  @Input() activeRiskFilter: boolean = true;
  @Input() activeCategoryFilter: boolean = true;
  @Input() activeFilterButton: boolean = true;


  ngOnInit() {   
    this.updateLocations();
    this.updateCategorias();
    this.updateRiesgos();
    this.updateFiltersSize();
  } 

  ngOnChanges(changes:SimpleChanges){
    this.updateFiltersSize();
  }

  updateFiltersSize(){
    var filterCount=0;
    filterCount=filterCount+Number(this.activeLocationFilter);
    filterCount=filterCount+Number(this.activeCategoryFilter);
    filterCount=filterCount+Number(this.activeRiskFilter);
    this.filterColSize=12/filterCount;
  }

  updateLocations() {
    this.locaciones = this.LocServ.getLocations();
    this.locaciones = this.LocServ.activateLocations(this.locaciones);
  }

  updateRiesgos() {
    this.riesgos = [
      { value: "Muy Alto",description:"Muy Alto", active: true },
      { value: "Alto",description:"Alto", active: true },
      { value: "Intermedio",description:"Intermedio", active: true },
      { value: "Bajo",description:"Bajo", active: true },
      { value: "Nulo",description:"Nulo", active: true },
      { value: "noInfo",description:"Sin información", active: true }
    ]
  }
  toggleAllRiesgos(active:boolean){
    if( this.riesgos){
      this.riesgos.forEach(rie=>{rie.active=active})
    }
    this.notifyChange();
  }
  toggleAllCategorias(active:boolean){
    if( this.categorias){
      this.categorias.forEach(cat=>{cat.active=active})
    }
    this.notifyChange();
  }
  toggleAllLocaciones(active:boolean){
    if( this.locaciones){
      this.locaciones.provincias.forEach(prov=>{this.recursiveLocationActiveToggle(prov,active);})
    }
    this.notifyChange();
  }

  updateCategorias() {
    this.categorias = [
      { value: "Asada",description:"Oficina de Asada", active: true },
      { value: "Tanque",description:"Tanque", active: true },
      { value: "SistemaDistribucion",description:"Sistema Distribución", active:true},
      { value: "TanqueQG",description:"Tanque Quebrada Gradiente", active:true},
      { value : "SistemaCloracion",description: "Sistema Cloración", active:true},
      { value: "CaptacionSuperficial",description:"Captación Superficial", active: true },
      { value: "CaptacionNaciente",description:"Captación Naciente", active: true },
      { value: "Naciente",description:"Naciente", active: true }
    ]
  }

  private LocationfilterCheckboxChange(event, loc: location) {
    if (this.activeLocationFilter) {
      //try {
        this.recursiveLocationActiveToggle(loc,(event.target.checked||false));
     /* } 
      catch (ex) {
        loc.active = true;
        event.target.checked = true;
      }*/
      this.notifyChange();
    }
  }
  private recursiveLocationActiveToggle(loc:location,active:boolean){
      loc.active=active;
      var locations:location[]=
      ((<provincia>loc).cantones) || ((<canton>loc).distritos);
      if(locations){
        locations.forEach(loc=>{
          this.recursiveLocationActiveToggle(loc,active);
        });
      }

  }

  private toggleActiveLocation(locations: location[], activate: boolean) {
    try {
      locations.forEach(loc => {
        loc.active = activate;
      });
    }
    catch(ex){}
  }

  private CategoryfilterCheckboxChange(event, value: string) {
    var filterParm: filterParam;
    if (this.activeCategoryFilter) {
      this.categorias.forEach(param => {
        if (param.value == value) {
          filterParm = param;
        }
      });
      try {
        filterParm.active = event.target.checked;

      } catch (ex) {
        filterParm.active = true;
        event.target.checked = true;
      }
      this.notifyChange();
    }
    
  }

  private RiskfilterCheckboxChange(event, value: string) {
    var filterParm: filterParam;
    if (this.activeRiskFilter) {
      this.riesgos.forEach(param => {
        if (param.value == value) {
          filterParm = param;
        }
      });
      try {
        filterParm.active = event.target.checked;
      } catch (ex) {
        
        filterParm.active = true;
        event.target.checked = true;
      }
      this.notifyChange();
    }
  }

  generateFilterConfiguration() {
    this.filterConfiguration = { 'locaciones': this.locaciones, 'riesgos': [], 'categorias': [] };
    this.filterConfiguration.locaciones = this.locaciones;
    this.filterConfiguration.categorias = this.categorias;
    this.filterConfiguration.riesgos = this.riesgos;
  }

  notifyChange() {
    this.generateFilterConfiguration();
    this.notify.emit(this.filterConfiguration);
  }
  
  autohide(){
    setTimeout(function () {
      document.getElementById('foo').style.display='none';
  }, 10000);
  return false;
  }

}

export interface filterConfig {
  locaciones: locaciones;
  riesgos: filterParam[];
  categorias: filterParam[];
}

export interface filterParam {
  value: string;
  description:string;
  active: boolean;
}