export class Asada{
    $key?: string;
    idAsada: string;
    name: string;
    tags: string;
    province: string;
    district: string;
    subDistrict: string;
    geoCode: number;
    location: string;
    inCharge: string;
    phoneNumber: string;
    email: string;
    office:{
        lat: number;
        long: number;
    };
    asadaInfras: string[];
    numberSubscribed: number;
    population: number;
    minaeRegistration: string;
    concessionNumber: string;
    concessionDue: {
        day: number,
        month: number,
        year: number
    };
    zoneType: string;
    adminEntity: string;
    waterProgram: string;
    type: string;

    //New data by Luis
    adminEntityName: string;
    legalResponsableWorkersName: string;
    legalResponsablePhone: string;
    fountains: number;
    nascent: number;
    superficial: number;
    waterWells: number;
    conductionMaterial: string;
    tanksNumber: number;
    supplyMechanisms: string;
    desinfection: string;
    systemType: string;
    date: string;

    
}