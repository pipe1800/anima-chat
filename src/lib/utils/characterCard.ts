import { get, set, text } from 'png-itxt';
import { Buffer } from 'buffer';

// Helper function to convert a File to a Buffer
const toBuffer = (file: File): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(Buffer.from(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer.'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses a PNG character card to extract its character data.
 * This function now correctly handles tEXt, zTXt, and iTXt chunks.
 * @param {File} file The PNG file uploaded by the user.
 * @returns {Promise<any>} A promise that resolves to the parsed character JSON object.
 */
export const parseCharacterCard = async (file: File): Promise<any> => {
  if (!file || file.type !== 'image/png') {
    throw new Error('File is not a valid PNG image.');
  }

  try {
    const buffer = await toBuffer(file);
    const textChunk = get(buffer, 'chara');

    if (!textChunk) {
      throw new Error('No character data found in the PNG file. The card may be a simple image.');
    }

    // The data is Base64 encoded JSON. Decode it.
    const jsonString = Buffer.from(textChunk.value, 'base64').toString('utf8');

    try {
      const parsedData = JSON.parse(jsonString);
      console.log('Successfully parsed character data:', parsedData);
      return parsedData;
    } catch (e) {
      throw new Error('Failed to parse character data. The data chunk may be corrupt.');
    }
  } catch (error) {
    console.error("Error parsing character card:", error);
    // Rethrow a more user-friendly error message.
    if (error instanceof Error && error.message.includes('Not a PNG')) {
       throw new Error('File is not a valid PNG or is corrupted.');
    }
    throw error;
  }
};