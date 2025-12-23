/**
 * CSV 解析工具
 */

export interface CSVData {
  headers: string[]
  rows: string[][]
}

/**
 * 解析 CSV 字符串
 */
export function parseCSV(csvText: string): CSVData {
  const lines = csvText.trim().split('\n')
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // 第一行是标题
  const headers = parseCSVLine(lines[0])
  
  // 其余行是数据
  const rows = lines.slice(1).map(line => parseCSVLine(line))

  return { headers, rows }
}

/**
 * 解析 CSV 行（处理逗号分隔的值）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

