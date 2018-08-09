import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NotificationForm } from '../../common/model/FormNotification';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Notification } from '../../common/model/Notification';
import { AngularFireService } from '../../common/service/angularFire.service';
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { NewNotificationService } from "app/components/new-notification/new-notification.service";
import { GetUserDetailsService } from "app/components/profile-header/get-user-details.service";
import { ToasterService, ToasterConfig } from 'angular2-toaster';


@Component({
	selector: 'app-new-notification',
	templateUrl: './new-notification.component.html',
	styleUrls: ['./new-notification.component.scss'],
	providers: [AngularFireService, NewNotificationService, GetUserDetailsService, ToasterService]
})
export class NewNotificationComponent implements OnInit {



	private username = '';
	private userdid = '';
	private Subject : String;
	private sub: any;

	
	// the object that handles the form
	public addNotificationForm: FormGroup;
	private newNotification: NotificationForm = new NotificationForm();
	private newNotification2: NotificationForm = new NotificationForm();

	/*			Toast variables		*/
	public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});

	constructor(
		private getUserDetailsService: GetUserDetailsService,
		private af: AngularFire,
		private router: Router,
		private fb: FormBuilder,
		private angularFireService: AngularFireService,
		private toasterService: ToasterService,
		private route: ActivatedRoute
	) { }

	user: FirebaseAuthState;
	isLoggedIn: boolean;



	ngOnInit() {

		this.sub = this.route.params
			.subscribe((params: Params) => {
				this.Subject = params['subject'];
			});

		if (this.Subject){
			this.builForm();
			this.fillForm();
		}
		else{
			this.builForm();		
		}
		this.af.auth.subscribe(user => {
			if (user) {
				// user logged in
				this.user = user;
				this.isLoggedIn = true;
				var userDetails = this.getUserDetailsService.getUserDetails(this.user.uid);
				userDetails.subscribe(
					results => {
						this.username = results.nombre + ' ' + results.apellidos;
						this.userdid = results.$key;
					}
				);


			}
			else {
				// user not logged in
				this.isLoggedIn = false;
			}
		});



	}

	fillForm(){
		this.addNotificationForm.patchValue({ 'userreceiver': this.Subject});
	}

	onSubmit() {
		//Extracts the values from the forms
		this.newNotification = this.addNotificationForm.value;

		const notf: Notification = {
			message: this.newNotification.message,
			subject: this.newNotification.subject,
			userid: this.userdid,
			username: this.username,
			userreceiver: this.newNotification.userreceiver
		};


		this.addNewNotifica(notf);

	}

	/*		DB methods		*/

	addNewNotifica(pNotif) {
		this.angularFireService.addNewNotification(pNotif);
		this.popToast();
		setTimeout(() => {
			this.router.navigate(['/notifications']);
		},
			2250);

	}


	builForm(): void {
		this.addNotificationForm = this.fb.group({
			'userreceiver': ['', Validators.required],
			'subject': ['', Validators.required],
			'message': ['', Validators.required],

		});
		this.addNotificationForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}

	onValueChanged(data?: any) {
		if (!this.addNotificationForm) { return; }
		const form = this.addNotificationForm;
		for (const field in this.formErrors) {
			// clear previous error message (if any)
			this.formErrors[field] = '';
			const control = form.get(field);
			if (control && control.dirty && !control.valid) {
				const messages = this.validationMessages[field];
				for (const key in control.errors) {
					this.formErrors[field] += messages[key] + ' ';
				}
			}
		}
	}


	popToast() {
		var toast = {
			type: 'success',
			title: 'Notificación enviada correctamente',
			showCloseButton: true
		};
		this.toasterService.pop(toast);
	}

	formErrors = {
		'userreceiver': '',
		'subject': '',
		'message': '',
	};

	validationMessages = {
		'userreceiver': {
			'required': 'Nombre requerido'
		},
		'subject': {
			'required': 'Asunto requerido'
		},
		'message': {
			'required': 'Mensaje requerido'
		}
	};

	cancel() {
		this.router.navigate(['/notifications']);
	}

}
