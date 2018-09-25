import {Infrastructure} from './Infrastructure';
import {FirebaseImg} from './FirebaseImg';

export interface Infrastructure{
    tags: string;
    $key?: string;
    name: string;
    risk: number;
    riskLevel: string;
    mainImg: FirebaseImg;
    img: FirebaseImg [];
    type: string;
    asada:{
        name: string;
        id: string;
    };
    lat: number;
    long: number;
}