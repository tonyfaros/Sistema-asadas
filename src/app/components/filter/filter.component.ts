import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
//import * as locations from './locations.json';


@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
  
})
  export class FilterComponent implements OnInit {

    data;
    //public Ubicaciones: provincia[];
    constructor(private http:Http) {
      this.http.get('assets/locations.json')
      .map((response: Response) => response.json())
      //.map((response: Response) => console.log("JSON: "+response.text()));
      .subscribe(res => this.setLocations(res));

      //this.http.get('assets/locations.json')
      //.map((response : Response) => <any> response.json())
        //.do(data =>console.log("JSON"+JSON.stringify(data)));
      console.log("asd");
  }
  setLocations(locations){
    this.data=locations;
    this.data.forEach(element => {
      console.log(element.name);
    });
    console.log("JSON:"+JSON.stringify(this.data));
  }
  
    ngOnInit() {
      
      //this.appmod.getLocations().subscribe(data => this.locations = data);
      /*console.log("inicio");
      try{
        this.http.get('http://localhost:4200/assets/locations.json')
        .map((response: Response) => response.json())
        .subscribe(data => this.locations = data);
      }catch(ex){console.log("Error----------->"+ex)}
        if(this.locations){
          console.log(JSON.stringify(this.locations)+"  ssss");
        }
        else{
          console.log("VACIO");
        }*/
  
    }
  
  }
interface provincia {
  key?: number;
  name: string;
  cantones?: canton[];
}

interface canton {
  key?: number;
  name: string;
  distritos?: distrito[];
}

interface distrito {
  key?: number;
  name: string
}