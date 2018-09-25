import {FirebaseImg} from './FirebaseImg';
import {Infrastructure} from './Infrastructure';

export class DistributionLine implements Infrastructure {

    creationDate: string;
    tags: string;
    $key?: string;
    name: string;
    risk: number;
    type: string;
    riskNames: string[];
    riskValues: number[];
    siNumber: number;
    riskLevel: string;
    mainImg: FirebaseImg;
    img: FirebaseImg [];

    asada:{
        name: string;
        id: string;
    };

    lat: number;
    long: number;

    details:{
        lineMaterial: string,
        repairsPerMonth: string
        
    };
}