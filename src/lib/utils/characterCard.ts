export interface CharacterCardData {
  name?: string;
  description?: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  [key: string]: any;
}

/**
 * Parses PNG chunks to find text data
 * @param buffer - The PNG file as ArrayBuffer
 * @returns Object containing text chunks
 */
function parsePNGChunks(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  let offset = 8; // Skip PNG signature
  const chunks: { [key: string]: string } = {};

  while (offset < buffer.byteLength) {
    const length = view.getUint32(offset);
    const type = new TextDecoder().decode(buffer.slice(offset + 4, offset + 8));
    const data = buffer.slice(offset + 8, offset + 8 + length);
    
    if (type === 'tEXt') {
      const textData = new Uint8Array(data);
      const nullIndex = textData.findIndex(byte => byte === 0);
      if (nullIndex !== -1) {
        const keyword = new TextDecoder().decode(textData.slice(0, nullIndex));
        const text = new TextDecoder().decode(textData.slice(nullIndex + 1));
        chunks[keyword] = text;
      }
    }
    
    offset += 12 + length; // length + type + data + crc
  }
  
  return chunks;
}

/**
 * Parses a PNG character card file to extract embedded character data
 * @param file - The PNG file containing character card data
 * @returns Promise<CharacterCardData> - The parsed character data
 * @throws Error if file is invalid or parsing fails
 */
export async function parseCharacterCard(file: File): Promise<CharacterCardData> {
  try {
    // Validate file type
    if (!file.type.includes('png')) {
      throw new Error('File must be a PNG image');
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse PNG chunks
    const chunks = parsePNGChunks(arrayBuffer);
    
    // Look for the 'chara' text chunk
    if (!chunks.chara) {
      throw new Error('No character data found in PNG file. This does not appear to be a character card.');
    }

    // Decode the Base64 string
    let decodedData: string;
    try {
      decodedData = atob(chunks.chara);
    } catch (error) {
      throw new Error('Failed to decode character data. The embedded data may be corrupted.');
    }

    // Parse the JSON
    let characterData: CharacterCardData;
    try {
      characterData = JSON.parse(decodedData);
    } catch (error) {
      throw new Error('Failed to parse character data as JSON. The data format may be invalid.');
    }

    // Validate that we have some essential character data
    if (!characterData || typeof characterData !== 'object') {
      throw new Error('Invalid character data format.');
    }

    // Process example dialogue if it exists
    if (characterData.example_dialogue && typeof characterData.example_dialogue === 'string') {
      characterData.example_dialogue = parseExampleDialogue(characterData.example_dialogue);
    }

    console.log('Successfully parsed character data:', characterData);
    return characterData;

  } catch (error) {
    console.error("Error parsing character card:", error);
    // Re-throw with more context if it's already our custom error
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new Error(`Unexpected error while parsing character card: ${String(error)}`);
  }
}

/**
 * Parses raw example dialogue string into structured array
 * @param rawDialogue - The raw example dialogue string from character card
 * @returns Array of dialogue objects with user and char keys
 */
export function parseExampleDialogue(rawDialogue: any): Array<{ user: string; char: string }> {
  // Handle cases where input is undefined or not a string
  if (!rawDialogue || typeof rawDialogue !== 'string') {
    return [];
  }
  
  // Clean the input string by removing any "START" tokens and trimming whitespace
  const cleanedDialogue = rawDialogue.replace(/START/gi, '').trim();
  
  if (!cleanedDialogue) {
    return [];
  }
  
  // Split the string into turns based on the {{user}}: marker
  const turns = cleanedDialogue.split(/(?={{user}}:)/i).filter(turn => turn.trim());
  
  const dialogues: Array<{ user: string; char: string }> = [];
  
  for (const turn of turns) {
    // Look for {{user}}: and {{char}}: patterns
    const userMatch = turn.match(/{{user}}:\s*(.*?)(?={{char}}:|$)/is);
    const charMatch = turn.match(/{{char}}:\s*(.*?)$/is);
    
    if (userMatch && charMatch) {
      const user = userMatch[1].trim();
      const char = charMatch[1].trim();
      
      if (user && char) {
        dialogues.push({ user, char });
      }
    }
  }
  
  return dialogues;
}