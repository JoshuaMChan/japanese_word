/**
 * CSV Parser Utility
 */

export interface CSVData {
  headers: string[]
  rows: string[][]
}

/**
 * Parse CSV string
 */
export function parseCSV(csvText: string): CSVData {
  const lines = csvText.trim().split('\n')
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // First line is headers
  const headers = parseCSVLine(lines[0])
  
  // Remaining lines are data
  const rows = lines.slice(1).map(line => parseCSVLine(line))

  return { headers, rows }
}

/**
 * Parse CSV line (handle comma-separated values)
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

