import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from "angularfire2/index"

@Injectable()
export class GetUserDetailsService {

  constructor(private af: AngularFire) { }
  getUserDetails(userUID: String): FirebaseObjectObservable<any> {
    const Obj$: FirebaseObjectObservable<any> =
      this.af.database.object('usuarios/' + userUID);
    return Obj$;
  }

  getNotifications():FirebaseListObservable<any>  {
		 const Obj$: FirebaseListObservable<any> = this.af.database.list('notifications');
	 	return Obj$;
	 }
}





