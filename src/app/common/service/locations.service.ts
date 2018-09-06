import { Injectable } from '@angular/core';
import { distinct } from 'rxjs/operator/distinct';

@Injectable()
export class LocationsService {
  
  locations: locaciones;
  constructor() { 
    var loc=require('assets/locations.json');
    this.locations = {'provincias':loc};
  }
  getLocations():locaciones {
    return this.locations
  }

  getListProvincias():string[]{
    var provincias:string[]=[];
    try{
      this.locations.provincias.forEach(prov => {
        provincias.push(prov.name);
      });
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      provincias=[];
    }
    return provincias;
  }

  prueba(){
    let pc=1;
    var loc=[]
    this.locations.provincias.forEach(prov => {
      var p:provincia={'key':pc,"name":prov.name,"cantones":[]};

      //prov.key=pc;
      loc.push(p);

      let cc=1;
      prov.cantones.forEach(cant => {
        var c:canton={'key':cc,"name":cant.name,"distritos":[]};
        //cant.key=cc;

        p.cantones.push(c);

        cant.key=cc;
        let dc=1;
        cant.distritos.forEach(dist => {
          
          var d:distrito={'key':dc,"name":dist.name};
          //dist.key=dc;

          c.distritos.push(d);
          
          dc++;
        });
        cc++;
      });
      pc++;
      
    });
    console.log(JSON.stringify(loc));
    
  }

  getProvincia(numProv:number):provincia{    
    try{
      return this.locations.provincias[numProv-1];
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      return ;
    }
  }
  
  getCanton(numProv:number,numCant:number):canton{
    try{
      return this.locations.provincias[numProv-1].cantones[numCant-1];
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      return ;
    }
  }


  getCantones(numProv:number):canton[]{
    var cantones:canton[]=[];
    try{
      return this.getProvincia(numProv).cantones;
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      cantones=[];
    }
    return cantones;
  }

  getListCantones(numProv:number):string[]{
    var cantones:string[]=[];
    try{
      this.getCantones(numProv).forEach(canton => {
        cantones.push(canton.name);
      });
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      cantones=[];
    }
    return cantones;
  }
  
  
  getDistrito(numProv:number,numCant:number,numDist:number):distrito{
    try{
      return this.getCanton(numProv,numCant).distritos[numDist-1];
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      return ;
    }
  }

  getDistritos(numProv:number,numCant:number):distrito[]{
    var distritos:distrito[]=[];
    try{
      return this.getCanton(numProv,numCant).distritos;
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      distritos=[];
    }
    return distritos;
  }

  getListDistritos(numProv:number,numCant:number):string[]{
    var distritos:string[]=[];
    try{
      this.getDistritos(numProv,numCant).forEach(distrito => {
        distritos.push(distrito.name);
      });
    }
    catch(ex){
      console.log("ErrorLocationsService: "+ex);
      distritos=[];
    }
    return distritos;
  }
  
  
}
export interface locaciones {
  provincias: provincia[];
}

export interface provincia {
  key?: number;
  name: string;
  cantones?: canton[];
}

export interface canton {
  key?: number;
  name: string;
  distritos?: distrito[];
}

export interface distrito {
  key?: number;
  name: string
}
