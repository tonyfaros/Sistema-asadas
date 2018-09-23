export class AsadaForm{
    location:{ 
        province: {code:number,name:string};
        canton:  {code:number,name:string};
        district:  {code:number,name:string};
        address: string;
    }
    //subDistrict: string;
    //district: string;
    asadaName: string;
    //province: string;
    geoCode: number;
    officeLatitude: number;
    officeLongitude: number;
    infrastructure: string[];
    numberSubscribed: number;
    population: number;
    phoneNumber: string;
    email: string;
    zoneType: string;
    concessionNumber: string;
    concessionDue?: string;
    minaeRegister: string;
    //location: string;
    adminEntity: string;
    inCharge: string;
    waterProgram: string;
}