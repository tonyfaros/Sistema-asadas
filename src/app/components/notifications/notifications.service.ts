import { Injectable } from '@angular/core';

import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from "angularfire2/index"

@Injectable()
export class NotificationsService {

  constructor(private af: AngularFire) { }

  getNotifications():FirebaseListObservable<any>  {
		 const Obj$: FirebaseListObservable<any> = this.af.database.list('notifications');
	 	return Obj$;
	 }

  getUserDetails(userUID: String): FirebaseObjectObservable<any> {
    const Obj$: FirebaseObjectObservable<any> =
      this.af.database.object('usuarios/' + userUID);
    return Obj$;
  }

}
