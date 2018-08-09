import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from "angularfire2/index"

@Injectable()
export class NewNotificationService {

    constructor(private af: AngularFire) { }

  getUserDetails(userUID: String): FirebaseObjectObservable<any> {
    const Obj$: FirebaseObjectObservable<any> =
      this.af.database.object('usuarios/' + userUID);
    return Obj$;
  }

}
