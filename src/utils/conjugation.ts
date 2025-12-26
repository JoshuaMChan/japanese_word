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

// ===== Helper Functions =====
const isIchidan = (conjClass: string): boolean => {
    return conjClass === 'SHIMO_ICHIDAN' || conjClass === 'KAMI_ICHIDAN'
}

const conjugateGodan = (verb: Verb, conjugation: Conjugation): Verb => {
    const result = { ...verb }
    const stem = verb.kanaEnd.slice(0, -1)
    const last = verb.kanaEnd.slice(-1)

    switch (conjugation) {
        case 'NEGATIVE':
            result.kanaEnd = stem + aStem[last] + 'ない'
            break
        case 'PASSIVE':
            result.kanaEnd = stem + aStem[last] + 'れる'
            break
        case 'CAUSATIVE':
            result.kanaEnd = stem + aStem[last] + 'せる'
            break
        case 'POLITE':
            result.kanaEnd = stem + iStem[last] + 'ます'
            break
        case 'TAI':
            result.kanaEnd = stem + iStem[last] + 'たい'
            break
        case 'SOU':
            result.kanaEnd = stem + iStem[last] + 'そう'
            break
        case 'MEIREI':
            result.kanaEnd = stem + eStem[last]
            break
        case 'POTENTIAL':
            result.kanaEnd = stem + eStem[last] + 'る'
            break
        case 'KATEI':
            result.kanaEnd = stem + eStem[last] + 'ば'
            break
        case 'IKOU':
            result.kanaEnd = stem + oStem[last] + 'う'
            break
        case 'TE':
            result.kanaEnd = stem + teConjugate[last]
            break
        case 'PASS':
            result.kanaEnd = stem + taConjugate[last]
            break
    }
    return result
}

const conjugateIchidan = (verb: Verb, conjugation: Conjugation): Verb => {
    const result = { ...verb }
    const stem = verb.kanaEnd.slice(0, -1)

    switch (conjugation) {
        case 'NEGATIVE':
            result.kanaEnd = stem + 'ない'
            break
        case 'PASSIVE':
            result.kanaEnd = stem + 'られる'
            break
        case 'CAUSATIVE':
            result.kanaEnd = stem + 'させる'
            break
        case 'POLITE':
            result.kanaEnd = stem + 'ます'
            break
        case 'TAI':
            result.kanaEnd = stem + 'たい'
            break
        case 'SOU':
            result.kanaEnd = stem + 'そう'
            break
        case 'MEIREI':
            result.kanaEnd = stem + 'ろ'
            break
        case 'POTENTIAL':
            result.kanaEnd = stem + 'られる'
            break
        case 'KATEI':
            result.kanaEnd = stem + 'れば'
            break
        case 'IKOU':
            result.kanaEnd = stem + 'よう'
            break
        case 'TE':
            result.kanaEnd = stem + 'て'
            break
        case 'PASS':
            result.kanaEnd = stem + 'た'
            break
    }
    return result
}

const conjugateSahen = (verb: Verb, conjugation: Conjugation): Verb => {
    const result = { ...verb }
    
    switch (conjugation) {
        case 'NEGATIVE':
            result.kanaStart = 'し'
            result.kanaEnd = 'ない'
            break
        case 'PASSIVE':
            result.kanaStart = 'さ'
            result.kanaEnd = 'れる'
            break
        case 'CAUSATIVE':
            result.kanaStart = 'さ'
            result.kanaEnd = 'せる'
            break
        case 'POLITE':
            result.kanaStart = 'し'
            result.kanaEnd = 'ます'
            break
        case 'TAI':
            result.kanaStart = 'し'
            result.kanaEnd = 'たい'
            break
        case 'SOU':
            result.kanaStart = 'し'
            result.kanaEnd = 'そう'
            break
        case 'MEIREI':
            result.kanaStart = 'し'
            result.kanaEnd = 'ろ'
            break
        case 'POTENTIAL':
            result.kanaStart = 'でき'
            result.kanjiStart = ['出来']
            result.kanaEnd = 'る'
            break
        case 'KATEI':
            result.kanaEnd = 'れば'
            break
        case 'IKOU':
            result.kanaStart = 'し'
            result.kanaEnd = 'よう'
            break
        case 'TE':
            result.kanaStart = 'し'
            result.kanaEnd = 'て'
            break
        case 'PASS':
            result.kanaStart = 'し'
            result.kanaEnd = 'た'
            break
    }
    return result
}

const conjugateKahen = (verb: Verb, conjugation: Conjugation): Verb => {
    const result = { ...verb }
    
    switch (conjugation) {
        case 'NEGATIVE':
            result.kanaStart = 'こ'
            result.kanaEnd = 'ない'
            break
        case 'PASSIVE':
            result.kanaStart = 'こ'
            result.kanaEnd = 'れる'
            break
        case 'CAUSATIVE':
            result.kanaStart = 'こ'
            result.kanaEnd = 'せる'
            break
        case 'POLITE':
            result.kanaStart = 'き'
            result.kanaEnd = 'ます'
            break
        case 'TAI':
            result.kanaStart = 'き'
            result.kanaEnd = 'たい'
            break
        case 'SOU':
            result.kanaStart = 'き'
            result.kanaEnd = 'そう'
            break
        case 'MEIREI':
            result.kanaStart = 'こ'
            result.kanaEnd = 'い'
            break
        case 'POTENTIAL':
            result.kanaEnd = 'られる'
            break
        case 'KATEI':
            result.kanaEnd = 'れば'
            break
        case 'IKOU':
            result.kanaStart = 'こ'
            result.kanaEnd = 'よう'
            break
        case 'TE':
            result.kanaStart = 'き'
            result.kanaEnd = 'て'
            break
        case 'PASS':
            result.kanaStart = 'き'
            result.kanaEnd = 'た'
            break
    }
    return result
}

// ===== Main Conjugation Function =====
export const conjugate = (verb: Verb, conjugation: Conjugation): Verb => {
    if (conjugation === 'DICT') {
        return { ...verb }
    }
    
    if (verb.conjClass === 'GODAN') {
        return conjugateGodan(verb, conjugation)
    }
    
    if (isIchidan(verb.conjClass)) {
        return conjugateIchidan(verb, conjugation)
    }
    
    if (verb.conjClass === 'SAHEN') {
        return conjugateSahen(verb, conjugation)
    }
    
    if (verb.conjClass === 'KAHEN') {
        return conjugateKahen(verb, conjugation)
    }
    
    return { ...verb }
}