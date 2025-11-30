
import fs from 'fs';
import path from 'path';

const filePath = 'c:\\Users\\Shaha\\Downloads\\feeding-entries-2025-11-30(4).csv';

const parseHebrewDate = (dateStr) => {
  if (!dateStr) return null
  
  console.log(`Parsing: "${dateStr}"`);

  const hebrewMonths = {
    'ינו׳': 0, 'ינואר': 0,
    'פבר׳': 1, 'פברואר': 1,
    'מרץ': 2,
    'אפר׳': 3, 'אפריל': 3,
    'מאי': 4,
    'יוני': 5,
    'יולי': 6,
    'אוג׳': 7, 'אוגוסט': 7,
    'ספט׳': 8, 'ספטמבר': 8,
    'אוק׳': 9, 'אוקטובר': 9,
    'נוב׳': 10, 'נובמבר': 10,
    'דצמ׳': 11, 'דצמבר': 11,
    // Add apostrophe versions just in case
    "ינו'": 0, "פבר'": 1, "אפר'": 3, "אוג'": 7, "ספט'": 8, "אוק'": 9, "נוב'": 10, "דצמ'": 11
  }

  try {
    // Remove quotes if present
    dateStr = dateStr.replace(/"/g, '').trim()
    
    const parts = dateStr.split(',')
    if (parts.length < 2) {
        console.log('Split by comma failed');
        return null;
    }
    
    const datePart = parts[0].trim()
    const timePart = parts[1].trim()
    
    const dateParts = datePart.split(' ')
    if (dateParts.length < 2) {
        console.log('Split date part by space failed');
        return null;
    }
    
    const day = parseInt(dateParts[0])
    const monthStr = dateParts[1]
    
    console.log(`MonthStr: "${monthStr}"`);
    for (let i = 0; i < monthStr.length; i++) {
        console.log(`Char ${i}: ${monthStr.charCodeAt(i)}`);
    }

    const month = hebrewMonths[monthStr]
    
    console.log(`Day: ${day}, MonthStr: "${monthStr}", Month: ${month}`);

    if (month === undefined || isNaN(day)) {
        console.log('Month undefined or Day NaN');
        return null;
    }
    
    const [hours, minutes] = timePart.split(':').map(Number)
    
    const now = new Date()
    const year = now.getFullYear()
    
    const date = new Date(year, month, day, hours, minutes)
    return date.toISOString()
  } catch (e) {
    console.error('Error parsing Hebrew date:', dateStr, e)
    return null
  }
}

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = content.split('\n').map(r => r.trim()).filter(r => r);
    
    // Remove BOM
    if (rows[0].charCodeAt(0) === 0xFEFF) {
        rows[0] = rows[0].slice(1);
    }

    const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
    console.log('Headers:', headers);
    
    const timeIndex = headers.findIndex(h => h.includes('זמן'));
    console.log('Time Index:', timeIndex);

    if (timeIndex === -1) {
        console.log('Could not find "זמן" column');
    } else {
        const firstRow = rows[1];
        console.log('First Row Raw:', firstRow);
        
        // Basic CSV parse
        let values = []
        let inQuote = false
        let currentValue = ''
        for (let i = 0; i < firstRow.length; i++) {
            const char = firstRow[i]
            if (char === '"') {
                inQuote = !inQuote
            } else if (char === ',' && !inQuote) {
                values.push(currentValue)
                currentValue = ''
            } else {
                currentValue += char
            }
        }
        values.push(currentValue)
        
        values = values.map(v => {
            v = v.trim()
            if (v.startsWith('"') && v.endsWith('"')) {
                v = v.slice(1, -1).replace(/""/g, '"')
            }
            return v
        })
        
        console.log('Parsed Values:', values);
        console.log('Time Value:', values[timeIndex]);
        
        const parsedDate = parseHebrewDate(values[timeIndex]);
        console.log('Parsed Date:', parsedDate);
    }

} catch (err) {
    console.error(err);
}
