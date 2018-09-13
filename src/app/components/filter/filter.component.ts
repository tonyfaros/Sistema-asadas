import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LocationsService, locaciones, location, provincia, canton } from "app/common/service/locations.service";

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


  constructor(private LocServ: LocationsService,) {
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

  ngOnChanges(){
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
      { value: "Muy Alto", active: true },
      { value: "Alto", active: true },
      { value: "Intermedio", active: true },
      { value: "Bajo", active: true },
      { value: "Nulo", active: true },
      { value: "No se capta", active: true }
    ]
  }

  updateCategorias() {
    this.categorias = [
      { value: "Tanque", active: true },
      { value: "Asada", active: true },
      { value: "CaptacionSuperficial", active: true },
      { value: "CaptacionNaciente", active: true },
      { value: "Naciente", active: true }
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
        event.target.checked = event.target.checked;
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
  active: boolean;
}