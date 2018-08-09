import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { Graphic } from '../../common/model/Graphic';
import { AngularFireService } from '../../common/service/angularFire.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';

@Component({
	selector: 'app-graphicdetails',
	templateUrl: './graphicdetails.component.html',
	styleUrls: ['./graphicdetails.component.scss'],
	providers: [AngularFireService, ToasterService]
})
export class GraphicdetailsComponent implements OnInit {

	private sub: any;
	public AsadaId: string;
	public graphicType: string;
	public GraphicId: string;

	private newGraphic: Graphic = new Graphic();

	public addGraphicForm: FormGroup;

	constructor(private route: ActivatedRoute,
		private fb: FormBuilder,
		private angularFireService: AngularFireService,
		private toasterService: ToasterService,
		private router: Router, ) { }
	public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});
	ngOnInit() {

		this.sub = this.route.params
			.subscribe((params: Params) => {
				this.AsadaId = params['id'];
				this.graphicType = params['graphictype'];
				this.GraphicId = params['idgraphic'];

			});

		if (this.graphicType == "GIRS") {
			this.builForm();

		}
		else {
			this.builForm2();

		}

	}

	onSubmit() {

		if (this.GraphicId) {


			//Extracts the values from the forms
			this.newGraphic = this.addGraphicForm.value;

			var valor4 = 0;
			var valor5 = 0;
			if (this.graphicType == "GIRS") {
				valor4 = Number(this.newGraphic.valor4);
				valor5 = Number(this.newGraphic.valor5);
			}
			else {
				valor4 = 0;
				valor5 = 0;
			}
			const graph: Graphic = {
				asada: this.AsadaId,
				type: this.graphicType,
				valor1: Number(this.newGraphic.valor1),
				valor2: Number(this.newGraphic.valor2),
				valor3: Number(this.newGraphic.valor3),
				valor4: valor4,
				valor5: valor5
			};


			this.updateGraph(this.GraphicId, graph);

		}
		else {
			//Extracts the values from the forms
			this.newGraphic = this.addGraphicForm.value;

			var valor4 = 0;
			var valor5 = 0;
			if (this.graphicType == "GIRS") {
				valor4 = Number(this.newGraphic.valor4);
				valor5 = Number(this.newGraphic.valor5);
			}
			else {
				valor4 = 0;
				valor5 = 0;
			}
			const graph: Graphic = {
				asada: this.AsadaId,
				type: this.graphicType,
				valor1: Number(this.newGraphic.valor1),
				valor2: Number(this.newGraphic.valor2),
				valor3: Number(this.newGraphic.valor3),
				valor4: valor4,
				valor5: valor5
			};


			this.addNewGraphic(graph);
		}
	}

	updateGraph(pId, graph): void {
		this.angularFireService.updateGraphic(pId, graph);
		this.popToast();
		setTimeout(() => {
			this.router.navigate(['/MapPage']);
		},
			2250);
	}

	addNewGraphic(pGrap) {
		this.angularFireService.addNewGraphic(pGrap);
		this.popToast();
		setTimeout(() => {
			this.router.navigate(['/MapPage']);
		},
			2250);

	}

	popToast() {
		var toast = {
			type: 'success',
			title: 'Gráfico editado correctamente',
			showCloseButton: true
		};
		this.toasterService.pop(toast);
	}

	cancel() {
		this.router.navigate(['/MapPage']);
	}
	builForm(): void {
		this.addGraphicForm = this.fb.group({
			'valor1': ['', Validators.required],
			'valor2': ['', Validators.required],
			'valor3': ['', Validators.required],
			'valor4': ['', Validators.required],
			'valor5': ['', Validators.required],
		});

		this.addGraphicForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}

	builForm2(): void {
		this.addGraphicForm = this.fb.group({
			'valor1': ['', Validators.required],
			'valor2': ['', Validators.required],
			'valor3': ['', Validators.required],

		});

		this.addGraphicForm.valueChanges
			.subscribe(data => this.onValueChanged2(data));
		this.onValueChanged2(); // (re)set validation messages now
	}

	onValueChanged(data?: any) {
		if (!this.addGraphicForm) { return; }
		const form = this.addGraphicForm;

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

	onValueChanged2(data?: any) {
		if (!this.addGraphicForm) { return; }
		const form = this.addGraphicForm;

		for (const field in this.formErrors2) {
			// clear previous error message (if any)
			this.formErrors2[field] = '';
			const control = form.get(field);
			if (control && control.dirty && !control.valid) {
				const messages = this.validationMessages2[field];
				for (const key in control.errors) {
					this.formErrors2[field] += messages[key] + ' ';
				}
			}
		}

	}

	formErrors = {
		'valor1': '',
		'valor2': '',
		'valor3': '',
		'valor4': '',
		'valor5': '',
	};

	formErrors2 = {
		'valor1': '',
		'valor2': '',
		'valor3': '',
	};

	validationMessages = {
		'valor1': {
			'required': '% faltante requerido'
		},
		'valor2': {
			'required': '% faltante requerido'
		},
		'valor3': {
			'required': '% faltante requerido'
		},
		'valor4': {
			'required': '% faltante requerido'
		},
		'valor5': {
			'required': '% faltante requerido'
		}
	};

	validationMessages2 = {
		'valor1': {
			'required': '% faltante requerido'
		},
		'valor2': {
			'required': '% faltante requerido'
		},
		'valor3': {
			'required': '% faltante requerido'
		}
	};


}
