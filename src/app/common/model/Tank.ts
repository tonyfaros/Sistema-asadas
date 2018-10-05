import {Infrastructure} from './Infrastructure';
import {FirebaseImg} from './FirebaseImg';

export class Tank implements Infrastructure{

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
        aqueductName: string,
        cleaning: string,
        inCharge: string,
        material: string,  
        registerNo: string,
        tankType: string,
        direction:string,
        volume: {
            amount: number,
            unit: string
        },
        creationDate: {
            day: number,
            month: number,
            year: number
        }
        
    };

    riskNames: string[];
    riskValues: number[];
    siNumber: number;
    riskLevel: string;
    sector: string;
    dateCreated: string;
}