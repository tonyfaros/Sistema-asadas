import {FirebaseImg} from './FirebaseImg';
import { Infrastructure } from './Infrastructure';

export class TankQG implements Infrastructure{

    creationDate: string;
    tags: string;
    $key?: string;
    name: string;
    tankType: string;
    tankMaterial: string;
    cleaningFrec: string;
    riskNames: string[];
    riskValues: number[];
    siNumber: number;
    riskLevel: string;
    sector: string;
    type: string;
    risk: number;

    mainImg: FirebaseImg;
    img: FirebaseImg [];

    asada:{
        name: string;
        id: string;
    };

    lat: number;
    long: number;

    details:{
        aqueductName: string,
        cleaning: string,
        inCharge: string,
          
        registerNo: string,
        direction:string,
        volume: {
            amount: number,
            unit: string
        },
        
        
    };
}