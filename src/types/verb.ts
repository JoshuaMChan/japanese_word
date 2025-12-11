import {TransitivityCode} from "../constants/transitivity.ts";

export interface Verb {
    KANA_START: string
    KANJI_START: string[]
    KANA_END: string
    ACCENT_TYPE: string[]
    CONJ_CLASS: ConjClassCode
    TRANSITIVITY: TransitivityCode
}

export type ConjClassCode =
    | 'GODAN'
    | 'KAMI_ICHIDAN'
    | 'SHIMO_ICHIDAN'
    | 'SAHEN'
    | 'KAHEN'
    | string

// 主形態：最终形态，只能选一个
export type PrimaryFormId =
    | 'DICT'   // 辞書形
    | 'MASU'   // ます形
    | 'TA'     // た形
    | 'TE'     // て形
    | 'KATEI'  // 仮定形（〜ば）
    | 'MEIREI' // 命令形
    | 'IKOU'   // 意向形（〜よう）
    | 'KIBOU'  // 希望形（〜たい）
    | 'PROG'   // 進行形（〜ている）
    | 'PERF'   // 完了形（〜てしまう')

// 语态槽（互斥）：受身 / 尊敬 / 使役 / 可能
export type VoiceId = 'PASSIVE' | 'CAUSATIVE' | 'POTENTIAL' | 'RESPECT'