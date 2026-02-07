// Simple CSV generator
export function generateCSV(data, fields) {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const header = fields.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return fields.map(field => {
      const value = item[field] || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}
