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

export const conjugate = (verb: Verb, conjugation: Conjugation): Verb => {
    let result = {...verb};
    if (verb.conjClass == 'GODAN') {

        const stem = verb.kanaEnd.slice(0, -1)
        const last = verb.kanaEnd.slice(-1)

        switch (conjugation) {
            case 'NEGATIVE':
                result.kanaEnd = stem + aStem[last] + 'ない'
                break;
            case 'PASSIVE':
                result.kanaEnd = stem + aStem[last] + 'れる'
                break;
            case 'CAUSATIVE':
                result.kanaEnd = stem + aStem[last] + 'せる'
                break;
            case 'POLITE':
                result.kanaEnd = stem + iStem[last] + 'ます'
                break;
            case 'TAI':
                result.kanaEnd = stem + iStem[last] + 'たい'
                break;
            case 'SOU':
                result.kanaEnd = stem + iStem[last] + 'そう'
                break;
            case 'MEIREI':
                result.kanaEnd = stem + eStem[last]
                break;
            case 'POTENTIAL':
                result.kanaEnd = stem + eStem[last] + 'る'
                break;
            case 'KATEI':
                result.kanaEnd = stem + eStem[last] + 'ば'
                break;
            case 'IKOU':
                result.kanaEnd = stem + oStem[last] + 'う'
                break;
            case 'TE':
                result.kanaEnd = stem + teConjugate[last]
                break;
            case 'PASS':
                result.kanaEnd = stem + taConjugate[last]
                break;
            case 'DICT':
            default:
                break;
        }
    } else if(verb.conjClass == 'SHIMO_ICHIDAN' || verb.conjClass == 'KAMI_ICHIDAN') {
        switch (conjugation) {
            case 'NEGATIVE':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'ない'
                break;
            case 'PASSIVE':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'られる'
                break;
            case 'CAUSATIVE':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'させる'
                break;
            case 'POLITE':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'ます'
                break;
            case 'TAI':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'たい'
                break;
            case 'SOU':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'そう'
                break;
            case 'MEIREI':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'ろ'
                break;
            case 'POTENTIAL':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'られる'
                break;
            case 'KATEI':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'れば'
                break;
            case 'IKOU':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'よう'
                break;
            case 'TE':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'て'
                break;
            case 'PASS':
                result.kanaEnd = verb.kanaEnd.slice(0, -1) + 'た'
                break;
            case 'DICT':
            default:
                break;
        }
    } else if (verb.conjClass == 'SAHEN') {
        switch (conjugation) {
            case 'NEGATIVE':
                result.kanaStart = 'し'
                result.kanaEnd = 'ない'
                break;
            case 'PASSIVE':
                result.kanaStart = 'さ'
                result.kanaEnd = 'れる'
                break;
            case 'CAUSATIVE':
                result.kanaStart = 'さ'
                result.kanaEnd = 'せる'
                break;
            case 'POLITE':
                result.kanaStart = 'し'
                result.kanaEnd = 'ます'
                break;
            case 'TAI':
                result.kanaStart = 'し'
                result.kanaEnd = 'たい'
                break;
            case 'SOU':
                result.kanaStart = 'し'
                result.kanaEnd = 'そう'
                break;
            case 'MEIREI':
                result.kanaStart = 'し'
                result.kanaEnd = 'ろ'
                break;
            case 'POTENTIAL':
                result.kanaStart = 'でき'
                result.kanjiStart = ['出来']
                result.kanaEnd = 'る'
                break;
            case 'KATEI':
                result.kanaEnd = 'れば'
                break;
            case 'IKOU':
                result.kanaStart = 'し'
                result.kanaEnd = 'よう'
                break;
            case 'TE':
                result.kanaStart = 'し'
                result.kanaEnd = 'て'
                break;
            case 'PASS':
                result.kanaStart = 'し'
                result.kanaEnd = 'た'
                break;
            case 'DICT':
            default:
                break;
        }
    } else if (verb.conjClass == 'KAHEN') {
        switch (conjugation) {
            case 'NEGATIVE':
                result.kanaStart = 'こ'
                result.kanaEnd = 'ない'
                break;
            case 'PASSIVE':
                result.kanaStart = 'こ'
                result.kanaEnd = 'れる'
                break;
            case 'CAUSATIVE':
                result.kanaStart = 'こ'
                result.kanaEnd = 'せる'
                break;
            case 'POLITE':
                result.kanaStart = 'き'
                result.kanaEnd = 'ます'
                break;
            case 'TAI':
                result.kanaStart = 'き'
                result.kanaEnd = 'たい'
                break;
            case 'SOU':
                result.kanaStart = 'き'
                result.kanaEnd = 'そう'
                break;
            case 'MEIREI':
                result.kanaStart = 'こ'
                result.kanaEnd = 'い'
                break;
            case 'POTENTIAL':
                result.kanaEnd = 'られる'
                break;
            case 'KATEI':
                result.kanaEnd = 'れば'
                break;
            case 'IKOU':
                result.kanaStart = 'こ'
                result.kanaEnd = 'よう'
                break;
            case 'TE':
                result.kanaStart = 'き'
                result.kanaEnd = 'て'
                break;
            case 'PASS':
                result.kanaStart = 'き'
                result.kanaEnd = 'た'
                break;
            case 'DICT':
            default:
                break;
        }
    }
    return result;
}