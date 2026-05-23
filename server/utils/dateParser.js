import * as chrono from 'chrono-node';

/**
 * Parses natural language date text and returns an ISO date string (YYYY-MM-DD).
 * Defaults to the year 2026 if no year is specified.
 * @param {string} text - The date text to parse (e.g. "July 20", "next Thursday", "2026-07-20")
 * @returns {string} - The parsed ISO date string or the original text if parsing fails.
 */
export function parseDeadline(text) {
  if (!text) return null;

  try {
    // Parse the date
    const parsedResults = chrono.parse(text);
    
    if (parsedResults && parsedResults.length > 0) {
      const result = parsedResults[0];
      const parsedDate = result.start.date();
      
      // If the year is not explicitly mentioned in the text, override/ensure it is 2026
      const hasExplicitYear = text.includes('202') || text.includes('19') || text.match(/\b\d{2}\b/); // simple check
      
      // The prompt specifically mentions: "If the user does not specify a year: Deliver by July 20, The backend automatically uses: 2026-07-20"
      // Chrono-node will default to the current year. Since the current system year is 2026, it will naturally parse as 2026.
      // But we will explicitly force it to 2026 if the text doesn't contain a 4-digit year, to be robust.
      if (!text.match(/\b20\d{2}\b/)) {
        parsedDate.setFullYear(2026);
      }

      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error parsing date with chrono-node:', error);
  }

  // Fallback to basic regex for ISO format YYYY-MM-DD
  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return isoMatch[0];
  }

  // Fallback to relative dates if chrono fails (e.g. "in 2 weeks")
  if (text.toLowerCase().includes('2 weeks') || text.toLowerCase().includes('two weeks')) {
    const d = new Date();
    d.setFullYear(2026);
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }
  
  return text; // Return the original text if all else fails
}
