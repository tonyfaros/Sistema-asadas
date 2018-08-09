import { Component, OnInit } from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2/index';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from "angular2-toaster/angular2-toaster";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  password: string;
  email: string;
  loginFrom: FormGroup;
  private error = '';
  public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});
  constructor(private af: AngularFire,
    private router: Router,
    private fb: FormBuilder, 
    private toasterService: ToasterService) { }

  ngOnInit() {
    this.emptyForm();
    this.af.auth.subscribe(user => {
			if (user) {
        this.router.navigate(['/'])
			}
		});
  }
  emptyForm(): void {
    this.loginFrom = this.fb.group({
      'email': ['', Validators.required],
      'password': ['', Validators.required],
    });
    this.loginFrom.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }
  onValueChanged(data?: any) {
    if (!this.loginFrom) { return; }
    const form = this.loginFrom;
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
  formErrors = {
    'email': '',
    'password': ''
  };
  validationMessages = {
    'email': {
      'required': 'Correo requerido'
    },
    'password': {
      'required': 'Contraseña requerida'
    }
  };
  popToast(message) {
		var toast = {
			type: 'error',
			title: message,
			showCloseButton: true
		};
		this.toasterService.pop(toast);
	}

  onSubmit() {
    var userLogin = this.loginFrom.value;
    this.af.auth.login({
      email: userLogin.email,
      password: userLogin.password
    }, {
        provider: AuthProviders.Password,
        method: AuthMethods.Password,
      }).then(
      (success) => {
        this.router.navigate(['/'])
      }).catch(
      (err: firebase.FirebaseError) => {
        console.log('Error on Login')
        console.log(err);
        switch (err.code) {
          case 'auth/invalid-email':
            this.error = 'El formato del correo no es valido';
            break;
          case 'auth/network-request-failed':
            this.error = 'Revise su conexión a internet';
            break;
          case 'auth/user-not-found':
            this.error = 'El correo no corresponde a ningún usuario registrado en el sistema';
            break;
          default:
            this.error = 'Error al iniciar sesión';

        }
        this.popToast(this.error);


      })
  }

}
