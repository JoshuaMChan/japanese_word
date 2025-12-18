import {Verb} from "../types/verb.ts"
import {
    aStem,
    iStem,
    eStem,
    oStem,
    teConjugate,
    taConjugate,
} from "./gotan.ts"

export type Conjugation =
// u stem
    | 'DICT'

    // a stem
    | 'NEGATIVE'
    | 'PASSIVE'
    | 'CAUSATIVE'
    | 'CAUSATIVE_PASSIVE'

    //i stem
    | 'POLITE'
    | 'TAI'
    | 'SOU'

    //e stem
    | 'MEIREI'
    | 'POTENTIAL'
    | 'KATEI'

    //o stem
    | 'IKOU'

    //gemination
    | 'TE'
    | 'PASS'

export const conjugateEnding = (verb: Verb, conjugation: Conjugation): string => {
    if (verb.conjClass == 'GODAN') {

        const stem = verb.kanaEnd.slice(0, -1)
        const last = verb.kanaEnd.slice(-1)

        switch (conjugation) {
            case 'NEGATIVE':
                return stem + aStem[last] + 'ない'
            case 'PASSIVE':
                return stem + aStem[last] + 'れる'
            case 'CAUSATIVE':
                return stem + aStem[last] + 'せる'
            case 'CAUSATIVE_PASSIVE':
                return stem + aStem[last] + 'せられる'
            case 'POLITE':
                return stem + iStem[last] + 'ます'
            case 'TAI':
                return stem + iStem[last] + 'たい'
            case 'SOU':
                return stem + iStem[last] + 'そう'
            case 'MEIREI':
                return stem + eStem[last]
            case 'POTENTIAL':
                return stem + eStem[last] + 'る'
            case 'KATEI':
                return stem + eStem[last] + 'ば'
            case 'IKOU':
                return stem + oStem[last] + 'う'
            case 'TE':
                return stem + teConjugate[last]
            case 'PASS':
                return stem + taConjugate[last]
            case 'DICT':
            default:
                return verb.kanaEnd
        }
    } else {
        switch (conjugation) {
            case 'NEGATIVE':
                return verb.kanaEnd.slice(0, -1) + 'ない'
            case 'PASSIVE':
                return verb.kanaEnd.slice(0, -1) + 'られる'
            case 'CAUSATIVE':
                return verb.kanaEnd.slice(0, -1) + 'させる'
            case 'CAUSATIVE_PASSIVE':
                return verb.kanaEnd.slice(0, -1) + 'させられる'
            case 'POLITE':
                return verb.kanaEnd.slice(0, -1) + 'ます'
            case 'TAI':
                return verb.kanaEnd.slice(0, -1) + 'たい'
            case 'SOU':
                return verb.kanaEnd.slice(0, -1) + 'そう'
            case 'MEIREI':
                return verb.kanaEnd.slice(0, -1) + 'ろ'
            case 'POTENTIAL':
                return verb.kanaEnd.slice(0, -1) + 'られる'
            case 'KATEI':
                return verb.kanaEnd.slice(0, -1) + 'れば'
            case 'IKOU':
                return verb.kanaEnd.slice(0, -1) + 'よう'
            case 'TE':
                return verb.kanaEnd.slice(0, -1) + 'て'
            case 'PASS':
                return verb.kanaEnd.slice(0, -1) + 'た'
            case 'DICT':
            default:
                return verb.kanaEnd
        }
    }
}