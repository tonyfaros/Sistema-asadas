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
	public filteredList: any [];
	public asadasCompareList: Asada [];
	private allList: any[];
	private searchFirebase: any;
	private searchFirebase2: any;
	public userAccess;
	private user;
	public isLoggedIn: boolean;


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
		this.asadasCompareList.push(new Asada ());
		this.asadasCompareList.push(new Asada ());
		this.asadasCompareList.push(new Asada ());
		this.asadasCompareList.push(new Asada ());
	}

	ngOnDestroy(): void {
		if (this.sub != null)
			this.sub.unsubscribe();
		this.filteredList = [];
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
		this.filteredList = [];
		this.allList = [];

	}

	getResult(): void {
		this.allList = this.filteredList = [];	
		this.searchFirebase = this.searchService.search("asadas");
		this.searchFirebase.subscribe(
			results => {
				this.filteredList = results;
			}
		);
		this.searchFirebase2 = this.searchService.search("infraestructura");
		this.searchFirebase2.subscribe(
			results => {
				this.allList = results;
			}
		);
	}

	onSelectedItem(elem: any, asada: number): void {
		elem.nascent = 0;
		elem.superficial = 0;
		elem.tanksNumber = 0;
		elem.fountains = 0;
		elem.waterWells = 0;
		for (let infra of this.allList) {
			if (elem.$key == infra.asada.id) {
				if (infra.type == `CaptacionNaciente`) {
					elem.nascent++;
				} 
				else if (infra.type == `CaptacionSuperficial`) {
					elem.superficial++;
				}
				else if (infra.type == `Tanque` || infra.type == `TanqueQG`) {
					elem.tanksNumber++;
				} 
				else if (infra.type == `SistemaCloracion`) {
					elem.fountains++;
				}
				else if (infra.type == `SistemaDistribucion` || infra.type == `LineaDistribucion`) {
					elem.waterWells++;
				} 
				else {
					//nada
				}
			}
		}

		switch(asada){
			case 1:
					this.asadasCompareList[0] = (elem);
					break;
			case 2:
					this.asadasCompareList[1] = (elem);
					break;
			case 3:
					this.asadasCompareList[2] = (elem);
					break;
			case 4: 
					this.asadasCompareList[3] = (elem);
					break;
			default:
					break;


		}

	}

}
