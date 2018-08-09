import {Infrastructure} from './Infrastructure';
import {FirebaseImg} from './FirebaseImg';

export class SuperficialWater implements Infrastructure{
    tags: string;
    $key?: string;
    name: string;
    risk: number;
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
        aqueductInCharge: string,
        inCharge: string,
        registerMINAE: string,
        registerARS: string,
        cleaningFrec: string,
        otherCleaning?: string
    };
    //New data by Luis
    riskNames: string[];
    riskValues: number[];
    siNumber: number;
    riskLevel: string;
    dateCreated: string;
}