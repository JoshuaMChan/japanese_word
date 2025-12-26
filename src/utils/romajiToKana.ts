/**
 * Convert romaji to hiragana for search purposes
 * This is a simplified converter that handles common patterns
 */

const romajiToHiraganaMap: Record<string, string> = {
  // Basic vowels
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  // K line
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  // S line
  'sa': 'さ', 'shi': 'し', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'za': 'ざ', 'ji': 'じ', 'zi': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  // T line
  'ta': 'た', 'chi': 'ち', 'ti': 'ち', 'tsu': 'つ', 'tu': 'つ', 'te': 'て', 'to': 'と',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  // N line
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  // H line
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  // M line
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  // Y line
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  // R line
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  // W line
  'wa': 'わ', 'wo': 'を', 'n': 'ん',

  // Small characters
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
  'sya': 'しゃ', 'syu': 'しゅ', 'syo': 'しょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
  'zya': 'じゃ', 'zyu': 'じゅ', 'zyo': 'じょ',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
  'tya': 'ちゃ', 'tyu': 'ちゅ', 'tyo': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
}

/**
 * Convert romaji string to hiragana
 * This is a basic converter - for production use, consider a more robust library
 */
export function romajiToHiragana(romaji: string): string {
  const lower = romaji.toLowerCase().trim()
  if (!lower) return ''
  
  let result = ''
  let i = 0
  
  // Map for geminated consonants (double consonants -> っ + single consonant)
  const geminateMap: Record<string, string> = {
    'tt': 'っ', 'kk': 'っ', 'ss': 'っ', 'pp': 'っ', 'cc': 'っ',
    'dd': 'っ', 'gg': 'っ', 'bb': 'っ', 'mm': 'っ', 'nn': 'っ', 'rr': 'っ',
    'zz': 'っ', 'jj': 'っ', 'hh': 'っ', 'ff': 'っ', 'vv': 'っ', 'ww': 'っ', 'yy': 'っ',
    'll': 'っ', 'xx': 'っ'
  }
  
  while (i < lower.length) {
    // Check for geminated consonants (double consonants like tta, kka, etc.)
    if (i + 2 < lower.length) {
      const twoChars = lower.substring(i, i + 2)
      const nextChar = lower[i + 2]
      
      // Check if it's a geminated consonant followed by a vowel
      if (geminateMap[twoChars] && /[aeiou]/.test(nextChar)) {
        // Get the single consonant + vowel mapping
        const singleConsonant = twoChars[0] + nextChar
        if (romajiToHiraganaMap[singleConsonant]) {
          result += geminateMap[twoChars] + romajiToHiraganaMap[singleConsonant]
          i += 3
          continue
        }
      }
    }
    
    // Try 3-character sequences first (e.g., kya, shi, chu)
    if (i + 3 <= lower.length) {
      const three = lower.substring(i, i + 3)
      if (romajiToHiraganaMap[three]) {
        result += romajiToHiraganaMap[three]
        i += 3
        continue
      }
    }
    
    // Try 2-character sequences (e.g., ka, shi, tsu)
    if (i + 2 <= lower.length) {
      const two = lower.substring(i, i + 2)
      if (romajiToHiraganaMap[two]) {
        result += romajiToHiraganaMap[two]
        i += 2
        continue
      }
    }
    
    // Try single character
    const one = lower[i]
    if (romajiToHiraganaMap[one]) {
      result += romajiToHiraganaMap[one]
    } else {
      // If not found, keep the original character (for numbers, punctuation, etc.)
      result += one
    }
    i++
  }
  
  return result
}

/**
 * Check if a string contains romaji characters (a-z, A-Z)
 */
export function containsRomaji(text: string): boolean {
  return /[a-zA-Z]/.test(text)
}

