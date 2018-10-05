export class AsadaForm{
    // location:{ 
    //     province: {code:number,name:string};
    //     canton:  {code:number,name:string};
    //     district:  {code:number,name:string};
    //     address: string;
    // }
    canton: number;
    district: number;
    asadaName: string;
    province: number;
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
    address: string;
    adminEntity: string;
    inCharge: string;
    waterProgram: string;
}