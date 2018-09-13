export class User {
    $key?: string;
    nombre: string;
    apellidos: string;
    correo: string;
    rol: string;
    password: string;
    asada?: {
        name: string;
        id: string;
        state:string;
        rol:string;
    };
    
}