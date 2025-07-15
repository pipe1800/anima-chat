/**
 * Capitalizes the first letter of each sentence and handles proper nouns
 */
export function capitalizeText(text: string): string {
  if (!text || text === 'No context') return text;
  
  // Split by sentence endings and process each sentence
  return text
    .split(/([.!?]+\s*)/)
    .map((part, index) => {
      // Skip punctuation parts
      if (/^[.!?\s]+$/.test(part)) return part;
      
      // Capitalize first letter of each sentence
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Filters context to focus on character-relevant information
 */
export function filterCharacterRelevantContext(contextKey: string, value: string): boolean {
  if (!value || value === 'No context') return false;
  
  // Always include shared environmental context
  if (contextKey === 'timeAndWeather' || contextKey === 'locationTracking') {
    return true;
  }
  
  // For other context types, filter out user-specific content
  const lowerValue = value.toLowerCase();
  const userIndicators = ['you are', 'user is', 'your mood', 'you feel', 'you\'re wearing', 'you have on'];
  
  // If it contains user indicators, skip it (unless it also mentions the character)
  const hasUserIndicators = userIndicators.some(indicator => lowerValue.includes(indicator));
  const hasCharacterIndicators = lowerValue.includes('character') || lowerValue.includes('they') || lowerValue.includes('their');
  
  // Include if it's character-focused or shared context
  return !hasUserIndicators || hasCharacterIndicators;
}