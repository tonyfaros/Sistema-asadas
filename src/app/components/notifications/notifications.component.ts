import { Component, OnInit } from '@angular/core';

import { NotificationsService } from "app/components/notifications/notifications.service";
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { GetUserDetailsService } from "app/components/profile-header/get-user-details.service";
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AngularFireService } from '../../common/service/angularFire.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [NotificationsService,GetUserDetailsService,AngularFireService]
})
export class NotificationsComponent implements OnInit {

  private allList: Notification [];
  public filterList: Notification [];
  public singleList: Notification [];
  private userName = '';
  private agregado = false;

  public message = '';


  constructor(private notificationService : NotificationsService,private af: AngularFire,
		private getUserDetailsService: GetUserDetailsService,private router: Router,private angularFireService: AngularFireService) { 

     this.allList = [];
     this.filterList = [];
     this.singleList = [];
  }

  user: FirebaseAuthState;
  isLoggedIn: boolean;

  ngOnInit() {


    this.af.auth.subscribe(user => {
			if (user) {
				// user logged in
				this.user = user;
        this.isLoggedIn = true;
				var userDetails = this.getUserDetailsService.getUserDetails(this.user.uid);
				userDetails.subscribe(
					results => {
						this.userName = results.nombre + ' ' + results.apellidos;
            this.getNotifications();
            
					}
				);

        
			}
			else {
				// user not logged in
				this.isLoggedIn = false;
			}
		});

  }

  public getNotifications(): void{
      this.notificationService.getNotifications()
			.subscribe(
				results => {
					this.allList = results;
          this.filterNotifications();
				} 
			);
  }

  notificationmarkers: Notification[];

  public filterNotifications(): void{

      for (let entry of this.allList) {

        if (entry.userreceiver == this.userName){

            var notificationmarkers = {
                  $key : entry.$key,
                  message:entry.message,
                  subject: entry.subject,
                  userid: entry.userid,
                  username : entry.username,
                  userreceiver : entry.userreceiver
            }

            this.filterList.push(notificationmarkers);

        }


      }

  }

  setDetails(elem: any) {

    if (this.agregado == false){
      var notificationmarkers = {
                    $key : elem.$key,
                    message:elem.message,
                    subject: elem.subject,
                    userid: elem.userid,
                    username : elem.username,
                    userreceiver : elem.userreceiver
              }
      
      this.singleList.push(notificationmarkers);
      this.agregado = true;
    }
    else{

        var notificationmarkers = {
                    $key : elem.$key,
                    message:elem.message,
                    subject: elem.subject,
                    userid: elem.userid,
                    username : elem.username,
                    userreceiver : elem.userreceiver
              }
        this.singleList.pop();
        this.singleList.push(notificationmarkers);
    }

	}

  responder(elem: any){
    this.router.navigate(["/newNotification/"+elem.username]);
  }

  deleteNotf(elem: any) {
		this.angularFireService.deleteNotification(elem.$key);
    this.allList = [];
    this.filterList = [];
    this.getNotifications();
		this.router.navigate(["/notifications"]);
	}

  crearNotific(){
    this.router.navigate(["/newNotification"]);
  }


}


interface Notification{
  $key?: string;
  message:string;
  subject: string;
  userid: string;
  username : string;
  userreceiver : string;
}


