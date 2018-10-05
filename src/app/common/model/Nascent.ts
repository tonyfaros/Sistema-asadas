import {Infrastructure} from './Infrastructure';
import {FirebaseImg} from './FirebaseImg';

export class Nascent implements Infrastructure{

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
        aqueductInCharge: string,
        inCharge: string,
        registerMINAE: string,
        nascentType: string,
        registerARS: string,

    };

    //New data by Luis
    dateCreated: string;
    riskNames: string[];
    riskValues: number[];
    siNumber: number;
    riskLevel: string;
}