import {Infrastructure} from './Infrastructure';
import {FirebaseImg} from './FirebaseImg';


export class Chlorination implements Infrastructure{
    tags: string;
    $key?: string;
    name: string;
    risk: number;
    mainImg: FirebaseImg;
    img: FirebaseImg [];
    type: string;
    asada:{
        name: string;
        id: string;
    };
    lat: number;
    long: number;

  details:{
    inCharge: string;
    aqueductName: string;
    aqueductInCharge: string;
    ubication: string;
    chlorinType: string;
    dosageType: string;
    installationDate: {
        day: number,
        month: number,
        year: number
    };
    AqueductCreationDate: {
        day: number,
        month: number,
        year: number
    };
  };
  //New data by Luis
  location: string;
  dateInstalled: string;
  riskNames: string[];
  riskValues: number[];
  siNumber: number;
  riskLevel: string;
  dateCreated: string;
}