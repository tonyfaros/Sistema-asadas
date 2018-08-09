import { Component, OnInit } from '@angular/core';
import { AngularFire,FirebaseAuthState } from 'angularfire2/index';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLoggedIn:boolean;
  constructor(private af: AngularFire) { }
  
  ngOnInit() {
    this.af.auth.subscribe(user => {
		if(user) {
			this.isLoggedIn = true;
		}
		else {
			this.isLoggedIn = false;
		}});
  }

}
