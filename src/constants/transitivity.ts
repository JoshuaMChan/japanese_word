export type TransitivityCode = 'VI' | 'VT' | 'VIT' | 'OTHER'
export const TRANSITIVITY_JA: Record<string, string> = {
    VI: '自動詞',
    VT: '他動詞',
    VIT: '自他動詞',
    OTHER: 'その他',
}
