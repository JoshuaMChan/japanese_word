// ===== アクセント 分段 =====
import {Verb} from "../types/verb.ts";

type AccentSegment = { cls: string; text: string }

export const accentSegments = (v: Verb, accent: string): AccentSegment[] => {
    const all = v.KANA_START + v.KANA_END
    const first = all.charAt(0)
    const rest = all.substring(1)

    switch (accent) {
        case 'ATA': // 頭高型
            return [
                { cls: 'h2l', text: first },
                { cls: 'l', text: rest },
            ]
        case 'NAKA': { // 中高型
            if (rest.length <= 1) {
                return [
                    { cls: 'l2h', text: first },
                    { cls: 'h2l', text: rest },
                ]
            }
            const mid = rest.slice(0, -1)
            const last = rest.slice(-1)
            return [
                { cls: 'l2h', text: first },
                { cls: 'h2l', text: mid },
                { cls: 'l', text: last },
            ]
        }
        case 'ODA': // 尾高型
        case 'HEI': // 平板型
            return [
                { cls: 'l2h', text: first },
                { cls: 'h', text: rest },
            ]
        default:
            return [{ cls: 'l', text: all }]
    }
}