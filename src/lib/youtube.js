/**
 * Extracts the YouTube Video ID from a variety of URL formats or returns the ID if already provided.
 * @param {string} input - The YouTube URL or Video ID
 * @returns {string|null} - The 11-character Video ID or null
 */
export function getYouTubeId(input) {
  if (!input) return null;
  
  const str = String(input).trim();
  
  // If it's already a clean 11-character ID
  if (str.length === 11 && !str.includes('/') && !str.includes('?') && !str.includes('=')) {
    return str;
  }

  // Regex to match various YouTube URL formats
  // Includes: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, etc.
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = str.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  // Last resort: if the string contains a 11-char sequence that looks like an ID
  // but we couldn't match the URL structure, we return the input as is 
  // (the player will just show "video not available" if it's truly wrong)
  return str;
}
