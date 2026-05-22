import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const DEFAULT_PROMPT =
  'Create a realistic virtual try-on image of the person wearing the garment. Preserve identity, body proportions, and background.';

const getImagesEdit = () => {
  if (typeof openai.images?.edit === 'function') {
    return openai.images.edit.bind(openai.images);
  }
  if (typeof openai.images?.edits === 'function') {
    return openai.images.edits.bind(openai.images);
  }
  return null;
};

export const generateTryOn = async (req, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      const err = new Error('Missing OPENAI_API_KEY in backend/.env');
      err.statusCode = 500;
      throw err;
    }

    const personFile = req.files?.person?.[0];
    const garmentFile = req.files?.garment?.[0];

    if (!personFile || !garmentFile) {
      const err = new Error('Both person and garment images are required');
      err.statusCode = 400;
      throw err;
    }

    const prompt = process.env.OPENAI_TRYON_PROMPT || DEFAULT_PROMPT;
    const model = process.env.OPENAI_TRYON_MODEL || 'gpt-image-1';
    const size = process.env.OPENAI_TRYON_SIZE || '1024x1024';

    const imagesEdit = getImagesEdit();
    if (!imagesEdit) {
      const err = new Error('OpenAI images edit API is unavailable in this SDK version');
      err.statusCode = 500;
      throw err;
    }

    const createImageInputs = (includeGarment) => {
      const inputs = [fs.createReadStream(personFile.path)];
      if (includeGarment) {
        inputs.push(fs.createReadStream(garmentFile.path));
      }
      return inputs;
    };

    let result;
    try {
      result = await imagesEdit({
        model,
        image: createImageInputs(true),
        prompt,
        size,
        response_format: 'b64_json',
      });
    } catch (err) {
      result = await imagesEdit({
        model,
        image: createImageInputs(false),
        prompt,
        size,
        response_format: 'b64_json',
      });
    }

    const imageData = result?.data?.[0] || {};
    const imageBase64 = imageData.b64_json || null;
    const imageUrl = imageData.url || null;

    if (!imageBase64 && !imageUrl) {
      const err = new Error('OpenAI image response missing image data');
      err.statusCode = 502;
      throw err;
    }

    res.json({
      success: true,
      data: {
        imageBase64: imageBase64 ? `data:image/png;base64,${imageBase64}` : null,
        imageUrl,
        model,
        size,
      },
    });
  } catch (err) {
    next(err);
  }
};
