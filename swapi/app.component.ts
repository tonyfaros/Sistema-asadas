import { Component } from '@angular/core';
import {Http, Response } from '@angular/http';
import { map } from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pruebaAngJs';
  page: any[];
  data: any[];
  characters: any[];

  url = 'https://swapi.co/api/people/';
  url2 = "https://swapi.co/api/films/2/"

constructor(private http: Http){

  this.getInfo(this.url);
  }

  getJson(){
    return this.http.get(this.url).pipe(
    map(res => res.json()));
  }

  getInfo(url){
    this.url=url;
    this.getJson().subscribe(data => {
      this.data = data
      this.page = this.data["results"]
      console.log(data);
    })
  }
  getInfo2(url){
    this.url=url;
    this.characters = [];
    this.getJson().subscribe(data => {
      this.data = data
      this.page = this.data["characters"]
      for(let link of this.page){
        this.url=link;
        this.getJson().subscribe(characters => {
          this.characters.push(characters)
          console.log(this.characters);
        })
      }
    })

    console.log(this.characters);
  }

  getNext(){
    this.url = this.data["next"];
    //this.getInfo();
  }

  getPrevious(){
    this.url = this.data["previous"];
    //this.getInfo();
  }

}
