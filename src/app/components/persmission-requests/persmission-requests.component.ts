import { Component, OnInit } from '@angular/core';
import { UserService } from "app/common/service/user.service";
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { GetUserDetailsService } from "app/components/profile-header/get-user-details.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-persmission-requests',
  templateUrl: './persmission-requests.component.html',
  styleUrls: ['./persmission-requests.component.scss'],
  providers: [UserService,GetUserDetailsService]

})
export class PersmissionRequestsComponent implements OnInit {

  constructor(private userService: UserService, private af: AngularFire, private getUserDetailsService: GetUserDetailsService,private router: Router) { }
  public requests;
  user: FirebaseAuthState;
  userRol;

  ngOnInit() {
    this.af.auth.subscribe(user => {
      this.user = user;
  });

    var userDetails = this.getUserDetailsService.getUserDetails(this.user.uid);
    userDetails.subscribe(
      results => {
        this.userRol = results.rol;

  });
  if(this.userRol!="Super Administrador" && this.userRol!="Profesor"){
    this.router.navigate(['/'])
  }

    this.getRequests();

  }
  getRequests() {
    this.userService.getUsuarios().subscribe(
      results => {
        this.requests = results;
        var usuariosList = new Array();
				if(this.userRol == "Super Administrador"){
          console.log("hola");
					for(var i = 0;i<results.length;i++){
						if(results[i]['rol'] == "Profesor"){ //*No estoy segura si solo profes o estudiantes tambien */
							if(results[i]['estado'] == "Pendiente"){
								usuariosList.push(results[i]);
							}
						}	
					}
				}
				else{
					for(var i = 0;i<results.length;i++){
						if(results[i]['profesor'] == this.user.uid){
							if(results[i]['estado'] == "Pendiente"){
								usuariosList.push(results[i]);
							}
						}	
					}
        }
        
				this.requests = usuariosList;
      }
    )
  }
  approve(request) {
    var uid = request.$key;
    this.userService.updateUserState(uid,"Aprobado");
    
  }
  denyRequest(request) {
    var uid = request.$key;
    this.userService.updateUserState(uid,"Rechazado");
  }

}
