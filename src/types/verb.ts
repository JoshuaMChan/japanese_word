import {TransitivityCode} from "../constants/transitivity.ts";

export interface Verb {
    kanaStart: string
    kanjiStart: string[]
    kanaEnd: string
    accent: string[]
    conjClass: ConjClassCode
    transitivity: TransitivityCode
}

export type ConjClassCode =
    | 'GODAN'
    | 'KAMI_ICHIDAN'
    | 'SHIMO_ICHIDAN'
    | 'SAHEN'
    | 'KAHEN'
    | string