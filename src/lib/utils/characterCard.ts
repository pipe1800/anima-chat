import pngChunkText from 'png-chunk-text';

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
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text chunks from PNG
    let chunks;
    try {
      chunks = pngChunkText.decode(uint8Array);
    } catch (error) {
      throw new Error('Failed to read PNG chunks. File may be corrupted or not a valid PNG.');
    }

    // Look for the 'chara' text chunk
    const charaChunk = chunks.find((chunk: any) => chunk.keyword === 'chara');
    
    if (!charaChunk) {
      throw new Error('No character data found in PNG file. This does not appear to be a character card.');
    }

    // Decode the Base64 string
    let decodedData: string;
    try {
      decodedData = atob(charaChunk.text);
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

    return characterData;

  } catch (error) {
    // Re-throw with more context if it's already our custom error
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new Error(`Unexpected error while parsing character card: ${String(error)}`);
  }
}

/**
 * Checks if a file appears to be a PNG character card
 * @param file - The file to check
 * @returns Promise<boolean> - True if the file appears to be a character card
 */
export async function isCharacterCard(file: File): Promise<boolean> {
  try {
    await parseCharacterCard(file);
    return true;
  } catch {
    return false;
  }
}