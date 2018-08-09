import {FirebaseImg} from './FirebaseImg';

export class TankQG{

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