import { Asada } from './Asada'
import { Chlorination } from './Chlorination'
import { DistributionLine } from './DistributionLine'
import { Nascent } from './Nascent'
import { SuperficialWater } from './SuperficialWater'
import { Tank } from './Tank'

export class Historial{
    $key?: string;
    date: string;
    dataAsadas: Asada[];
    dataInfraChlorination: Chlorination[];
    dataInfraDistributionLine: DistributionLine[];
    dataInfraNascent: Nascent[];
    dataInfraSuperficialWater: SuperficialWater[];
    dataInfraTank: Tank[];
}