// ===== Accent Segmentation =====
import {Verb} from "../types/verb.ts";

type AccentSegment = { cls: string; text: string }

export const accentSegments = (v: Verb, accent: string): AccentSegment[] => {
    const all = v.kanaStart + v.kanaEnd
    const first = all.charAt(0)
    const rest = all.substring(1)

    switch (accent) {
        case 'ATA': // Atamadaka (head-high)
            return [
                { cls: 'h2l', text: first },
                { cls: 'l', text: rest },
            ]
        case 'NAKA': { // Nakadaka (middle-high)
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
        case 'ODA': // Odaka (tail-high)
        case 'HEI': // Heiban (flat)
            return [
                { cls: 'l2h', text: first },
                { cls: 'h', text: rest },
            ]
        default:
            return [{ cls: 'l', text: all }]
    }
}