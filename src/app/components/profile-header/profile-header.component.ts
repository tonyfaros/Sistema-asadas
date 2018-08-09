import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { GetUserDetailsService } from "app/components/profile-header/get-user-details.service";
import { UserService } from "app/common/service/user.service";
import { ActivatedRoute, Params, Router } from '@angular/router';
@Component({
	selector: 'app-profile-header',
	templateUrl: './profile-header.component.html',
	styleUrls: ['./profile-header.component.scss'],
	providers: [GetUserDetailsService, UserService]
})
export class ProfileHeaderComponent implements OnInit {

	public userAccessRol = '';
	private userName = '';
	private userRol = '';
	private asada = '';
	private numRequest = 0;
	private numnotif = 0;

	private allList: Notification[];
	private filterList: Notification[];

	constructor(private af: AngularFire,
		private getUserDetailsService: GetUserDetailsService,
		private userService: UserService,
		private router: Router,
		private location: Location) {

		this.allList = [];
		this.filterList = [];

	}
	user: FirebaseAuthState;
	isLoggedIn: boolean;
	ngOnInit() {
		this.af.auth.subscribe(user => {
			if (user) {
				// user logged in
				this.user = user;
				this.getRolAccess();
				this.getRequests();
				this.isLoggedIn = true;
				var userDetails = this.getUserDetailsService.getUserDetails(this.user.uid);
				userDetails.subscribe(
					results => {
						this.userName = results.nombre + ' ' + results.apellidos;
						this.allList = [];
						this.filterList = [];
						this.getNotifications();
						if (this.userRol != "Super Administrador") {
							this.asada = results.asada.name;
						}
					}
				);

			}
			else {
				// user not logged in
				this.isLoggedIn = false;
			}
		});
	}

	goBack(): void {
		this.location.back();
	}
	getRolAccess() {
		this.userService.getRolAccess(this.user.uid).subscribe(
			results => {
				this.userRol = results.rol;
			}
		)
	}
	getRequests() {
		this.userService.getAsadasRequests().subscribe(
			results => {
				this.numRequest = results.length;
			}
		)
	}
	logout() {
		this.af.auth.logout().then(
			results => {
				setTimeout(() => {
					this.router.navigate(['/LoginPage']);
				},
					1250);
			}
		)
	}

	public getNotifications(): void {
		this.getUserDetailsService.getNotifications()
			.subscribe(
			results => {
				this.allList = results;
				this.filterNotifications();
			}
			);
	}

	public filterNotifications(): void {


		this.numnotif = 0;
		for (let entry of this.allList) {

			if (entry.userreceiver == this.userName) {
				this.numnotif = this.numnotif + 1;
			}

		}
	}

}


interface Notification {
	$key?: string;
	message: string;
	subject: string;
	userid: string;
	username: string;
	userreceiver: string;
}
