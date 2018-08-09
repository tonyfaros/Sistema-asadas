/* gabygarro (06/09/17): Esta página, junto con map-google.component y about-us.component
tienen un work around descrito en el issue https://github.com/angular/angular/issues/6595 */

import { Component, OnInit } from '@angular/core';
import { AngularFire } from "angularfire2";
import { UserService } from "app/common/service/user.service";

import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [UserService]
})
export class MenuComponent implements OnInit {
  public userAccess: any;
  public isLoggedIn: boolean;
  public isAdmin: boolean;
  public myASADALink: string;
  role: string;

  //private scrollExecuted: boolean = false;
  private fragment: string; // work-around

  constructor(private af: AngularFire, private userService: UserService, private route: ActivatedRoute) { }

  

  ngOnInit() {
    //this.route.fragment.subscribe(fragment => { this.fragment = fragment; }); // work-around

    this.userAccess = {};
    this.af.auth.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        //console.log(this.userService.isSuperAdmin(user.uid));
        this.userService.getRolAccess(user.uid).subscribe(
          results => {
            this.userAccess = results;
            
            if (this.userAccess.rol && (this.userAccess.rol == "Administración" || this.userAccess.rol == "Edición")) {
              this.isAdmin = true;
              this.myASADALink = "/asadaDetails/" + this.userAccess.asada;
            } else {
              this.isAdmin = false;
            }
          }
        )
      }
      else {
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    });
  }

}
