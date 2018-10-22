import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';



/*		Model-Entities		*/
import { Asada } from '../../common/model/Asada';

/*		Modules		*/
import { AngularFire, FirebaseListObservable } from 'angularfire2';

/*		Services		*/
import { AngularFireService } from 'app/common/service/angularFire.service';
import { UserService } from "app/common/service/user.service";
import { SearchService } from './search.service';

@Component({
	selector: 'app-compare-asadas',
	templateUrl: './compare-asadas.component.html',
	styleUrls: ['./compare-asadas.component.scss'],
	providers: [SearchService, UserService, AngularFireService]
})
export class CompareAsadasComponent implements OnInit {

	private sub: any;
	public allAsadasList: any[];
	public asadasList:any[]
	public asadasCompareList: Asada[];
	public allList: any[];
	private searchFirebase: any;
	private searchFirebase2: any;
	public userAccess;
	private user;
	public isLoggedIn: boolean;

	public maxComparedAmount: number = 4;


	constructor(
		private searchService: SearchService,
		private route: ActivatedRoute,
		private location: Location,
		private router: Router,
		private userService: UserService,
		private af: AngularFire,
		private angularFireService: AngularFireService) { }

	ngOnInit(): void {
		this.loadLocalAttributes();
		this.loadUserPermissions();
		this.asadasCompareList = [];

	}

	ngOnDestroy(): void {
		if (this.sub != null)
			this.sub.unsubscribe();
		this.allAsadasList = [];
		this.asadasList=[];
		this.allList = [];
	}

	loadUserPermissions() {
		this.userAccess = {};
		this.af.auth.subscribe(user => {
			if (user) {
				this.isLoggedIn = true;
				this.userService.getRolAccess(user.uid).subscribe(
					results => {
						this.userAccess = results;
						//this.userAccess.asada
					}
				)
			}
			this.getResult();

		});
	}


	loadLocalAttributes() {
		this.asadasList = [];
		this.allList = [];

	}

	getResult(): void {
		this.allList = this.allAsadasList= this.asadasList = [];
		this.searchFirebase = this.searchService.search("asadas");
		this.searchFirebase.subscribe(
			results => {
				this.allAsadasList=results;
				this.asadasList = results;
			}
		);
		this.searchFirebase2 = this.searchService.search("infraestructura");
		this.searchFirebase2.subscribe(
			results => {
				this.allList = results;
			}
		);
	}

	addAsada(elem: any): void {
		elem.nascent = 0;
		elem.superficial = 0;
		elem.tanksNumber = 0;
		elem.fountains = 0;
		elem.waterWells = 0;
		for (let infra of this.allList) {
			if (elem.$key == infra.asada.id) {
				switch (infra.type) {
					case (`CaptacionNaciente`): {
						elem.nascent++; break
					}
					case (`CaptacionSuperficial`): {
						elem.superficial++; break
					}
					case (`Tanque`): {
						elem.tanksNumber++; break
					}
					case (`TanqueQG`): {
						elem.tanksNumber++; break
					}
					case (`SistemaCloracion`): {
						elem.fountains++; break
					}
					case (`CaptacionNaciente`): {
						elem.nascent++; break
					}
					case (`SistemaDistribucion`): {
						elem.waterWells++; break
					}
					case (`LineaDistribucion`): {
						elem.waterWells++; break
					}
				}
			}
		}
		
		this.asadasCompareList.push(elem);
		this.asadasList=this.allAsadasList.filter(asada=>!this.asadasCompareList.includes(asada));
	}
	removeAsada(elem: Asada): void {
		if (elem)
			this.asadasCompareList = this.asadasCompareList.filter(asada => asada.$key != elem.$key);
	}

}
