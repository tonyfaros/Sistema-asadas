import { TomaInfra } from "./TomaInfra";

export class TomaDatos{
    $key?: string;
    idToma: string;
    nameAsada: string;
    dateCreated: string;
    status: string;
    idEstudiante: string;
    infraestructuras: TomaInfra[];
}