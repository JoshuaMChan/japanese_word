// src/utils/conjugation.ts

import type {
    Verb,
    ConjClassCode,
    PrimaryFormId,
    VoiceId,
} from '../types/verb'

// ===== 假名工具 =====
const dictKana = (v: Verb): string => v.KANA_START + v.KANA_END
const lastKana = (s: string): string => s.slice(-1)
const stem = (s: string): string => s.slice(0, -1)

// 五段 → ない 用
const godanNaEnd: Record<string, string> = {
    'う': 'わない',
    'く': 'かない',
    'ぐ': 'がない',
    'す': 'さない',
    'つ': 'たない',
    'ぬ': 'なない',
    'ぶ': 'ばない',
    'む': 'まない',
    'る': 'らない',
}

// 五段 → ます连用形
const godanMasuStemEnd: Record<string, string> = {
    'う': 'い',
    'く': 'き',
    'ぐ': 'ぎ',
    'す': 'し',
    'つ': 'ち',
    'ぬ': 'に',
    'ぶ': 'び',
    'む': 'み',
    'る': 'り',
}

// 五段 て／た 形
const godanTeTa = (word: string): { te: string; ta: string } => {
    const l = lastKana(word)
    const s = stem(word)

    if (word === 'いく') {
        return { te: s + 'って', ta: s + 'った' }
    }
    if (['う', 'つ', 'る'].includes(l)) {
        return { te: s + 'って', ta: s + 'った' }
    }
    if (['む', 'ぶ', 'ぬ'].includes(l)) {
        return { te: s + 'んで', ta: s + 'んだ' }
    }
    if (l === 'く') return { te: s + 'いて', ta: s + 'いた' }
    if (l === 'ぐ') return { te: s + 'いで', ta: s + 'いだ' }
    if (l === 'す') return { te: s + 'して', ta: s + 'した' }

    return { te: s + 'って', ta: s + 'った' }
}

// ===== 语态 (受身/使役/可能/尊敬) =====
const applyVoice = (v: Verb, voice: VoiceId | null): string => {
    const base = dictKana(v)
    const cls = v.CONJ_CLASS as ConjClassCode

    if (!voice) return base

    // サ変: ～する
    if (cls === 'SAHEN' || base.endsWith('する')) {
        const s = base.slice(0, -2)
        if (voice === 'CAUSATIVE') return s + 'させる'
        if (voice === 'PASSIVE' || voice === 'RESPECT') return s + 'される'
        if (voice === 'POTENTIAL') return s + 'できる'
        return base
    }

    // カ変: ～くる
    if (cls === 'KAHEN' || base.endsWith('くる')) {
        const s = base.slice(0, -2)
        if (voice === 'CAUSATIVE') return s + 'こさせる'
        if (voice === 'PASSIVE' || voice === 'RESPECT' || voice === 'POTENTIAL') {
            return s + 'こられる'
        }
        return base
    }

    const l = lastKana(base)
    const s = stem(base)
    const isIchidan = cls === 'KAMI_ICHIDAN' || cls === 'SHIMO_ICHIDAN'

    if (isIchidan) {
        if (voice === 'CAUSATIVE') return s + 'させる'
        if (voice === 'PASSIVE' || voice === 'RESPECT' || voice === 'POTENTIAL') {
            return s + 'られる'
        }
        return base
    }

    // 五段: 未然形（あ段）
    const aRow: Record<string, string> = {
        'う': 'わ',
        'く': 'か',
        'ぐ': 'が',
        'す': 'さ',
        'つ': 'た',
        'ぬ': 'な',
        'ぶ': 'ば',
        'む': 'ま',
        'る': 'ら',
    }
    const a = aRow[l] || ''

    if (voice === 'CAUSATIVE') {
        return a ? s + a + 'せる' : base + 'せる'
    }
    if (voice === 'PASSIVE' || voice === 'RESPECT') {
        return a ? s + a + 'れる' : base + 'れる'
    }

    if (voice === 'POTENTIAL') {
        const potEnd: Record<string, string> = {
            'う': 'える',
            'く': 'ける',
            'ぐ': 'げる',
            'す': 'せる',
            'つ': 'てる',
            'ぬ': 'ねる',
            'ぶ': 'べる',
            'む': 'める',
            'る': 'れる',
        }
        const e = potEnd[l]
        return e ? s + e : base
    }

    return base
}

// ===== 主形態 =====
const applyPrimary = (
    word: string,
    primary: PrimaryFormId,
    cls: ConjClassCode
): string => {
    if (primary === 'DICT') return word

    const l = lastKana(word)
    const s = stem(word)
    const isIchidan = cls === 'KAMI_ICHIDAN' || cls === 'SHIMO_ICHIDAN'
    const isGodan = !isIchidan

    if (primary === 'MASU') {
        if (isIchidan) return s + 'ます'
        const end = godanMasuStemEnd[l]
        return end ? s + end + 'ます' : word + 'ます'
    }

    if (primary === 'TA' || primary === 'TE' || primary === 'PROG' || primary === 'PERF') {
        const teTa = isGodan ? godanTeTa(word) : { te: s + 'て', ta: s + 'た' }
        if (primary === 'TA')   return teTa.ta
        if (primary === 'TE')   return teTa.te
        if (primary === 'PROG') return teTa.te + 'いる'
        if (primary === 'PERF') return teTa.te + 'しまう'
    }

    if (primary === 'KATEI') {
        if (isIchidan) return s + 'れば'
        const eRow: Record<string, string> = {
            'う': 'え','く': 'け','ぐ': 'げ','す': 'せ',
            'つ': 'て','ぬ': 'ね','ぶ': 'べ','む': 'め','る': 'れ',
        }
        const e = eRow[l]
        return e ? s + e + 'ば' : word + 'ば'
    }

    if (primary === 'MEIREI') {
        if (isIchidan) return s + 'ろ'
        const eRow: Record<string, string> = {
            'う': 'え','く': 'け','ぐ': 'げ','す': 'せ',
            'つ': 'て','ぬ': 'ね','ぶ': 'べ','む': 'め','る': 'れ',
        }
        const e = eRow[l]
        return e ? s + e : word
    }

    if (primary === 'IKOU') {
        if (isIchidan) return s + 'よう'
        const oRow: Record<string, string> = {
            'う': 'お','く': 'こ','ぐ': 'ご','す': 'そ',
            'つ': 'と','ぬ': 'の','ぶ': 'ぼ','む': 'も','る': 'ろ',
        }
        const o = oRow[l]
        return o ? s + o + 'う' : word + 'う'
    }

    if (primary === 'KIBOU') {
        if (isIchidan) return s + 'たい'
        const masuStem = godanMasuStemEnd[l]
        return masuStem ? s + masuStem + 'たい' : word + 'たい'
    }

    return word
}

// ===== 否定 =====
const negativeDict = (dictWord: string, cls: ConjClassCode): string => {
    if (cls === 'SAHEN' || dictWord.endsWith('する')) {
        const s = dictWord.slice(0, -2)
        return s + 'しない'
    }
    if (cls === 'KAHEN' || dictWord.endsWith('くる')) {
        const s = dictWord.slice(0, -2)
        return s + 'こない'
    }

    const l = lastKana(dictWord)
    const s = stem(dictWord)
    const isIchidan = cls === 'KAMI_ICHIDAN' || cls === 'SHIMO_ICHIDAN'

    if (isIchidan) return s + 'ない'

    const end = godanNaEnd[l]
    return end ? s + end : dictWord + 'ない'
}

const applyNegation = (
    word: string,
    primary: PrimaryFormId,
    dictWord: string,
    cls: ConjClassCode
): string => {
    if (primary === 'TE') {
        const neg = negativeDict(dictWord, cls)
        return neg.slice(0, -2) + 'なくて'
    }

    if (primary === 'DICT') {
        return negativeDict(dictWord, cls)
    }

    if (primary === 'MASU') {
        return word.slice(0, -2) + 'ません'
    }

    if (primary === 'TA') {
        return word.slice(0, -1) + 'なかった'
    }

    if (primary === 'KATEI') {
        const neg = negativeDict(dictWord, cls)
        return neg.slice(0, -2) + 'なければ'
    }

    if (primary === 'MEIREI') {
        return dictWord + 'な'
    }

    if (primary === 'IKOU') {
        const neg = negativeDict(dictWord, cls)
        return neg.slice(0, -2) + 'ないでおこう'
    }

    if (primary === 'KIBOU') {
        return word.slice(0, -2) + 'たくない'
    }

    if (primary === 'PROG') {
        if (word.endsWith('ている')) return word.slice(0, -3) + 'ていない'
        if (word.endsWith('でいる')) return word.slice(0, -3) + 'でいない'
        return word + 'ない'
    }

    if (primary === 'PERF') {
        if (word.endsWith('てしまう')) {
            return word.slice(0, -4) + 'てしまわない'
        }
        if (word.endsWith('でしまう')) {
            return word.slice(0, -4) + 'でしまわない'
        }
        return word.replace(/しまう$/, 'しまわない')
    }

    return word + 'ない'
}

// ===== 总入口：给所有参数，输出当前形 =====
export const buildForm = (
    v: Verb,
    primary: PrimaryFormId,
    voice: VoiceId | null,
    negative: boolean
): string => {
    const cls = v.CONJ_CLASS as ConjClassCode

    const dictWithVoice = applyVoice(v, voice)
    const primaryWord = applyPrimary(dictWithVoice, primary, cls)

    return negative
        ? applyNegation(primaryWord, primary, dictWithVoice, cls)
        : primaryWord
}

export const conjugatedEnding = (
    v: Verb,
    primary: PrimaryFormId,
    voice: VoiceId | null,
    negative: boolean
): string => {
    const full = buildForm(v, primary, voice, negative)
    const prefix = v.KANA_START
    return full.startsWith(prefix)
        ? full.slice(prefix.length)
        : full
}