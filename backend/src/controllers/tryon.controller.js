import fs from 'fs';
import { Client, handle_file } from "@gradio/client";

/**
 * Handle Try-On request
 */
export const generateTryOn = async (req, res) => {
  try {
    const personFile = req.files?.person?.[0];
    const garmentFile = req.files?.garment?.[0];

    // Options
    const model = req.body.model || 'gpt-4o'; // Not used anymore but kept for compatibility
    const size = req.body.size || '1024x1024'; 

    if (!personFile) {
      return res.status(400).json({ success: false, message: 'Person image is required' });
    }

    let b64 = null;
    let url = null;
    let isMock = false;

    if (!garmentFile) {
      // If no garment is provided, we can't do VTON. Just return mock.
      const fallbackData = fs.readFileSync(personFile.path);
      b64 = fallbackData.toString('base64');
      isMock = true;
    } else {
      try {
        console.log('Connecting to IDM-VTON Gradio Space...');
        const client = await Client.connect("yisol/IDM-VTON");
        
        console.log('Sending images to IDM-VTON (this may take a moment)...');
        const result = await client.predict("/tryon", [
          { 
            background: handle_file(personFile.path), 
            layers: [], 
            composite: null 
          }, 
          handle_file(garmentFile.path), 
          "garment", 
          true, 
          false, 
          30, 
          42
        ]);
        
        console.log('IDM-VTON generation successful!');
        const outImage = result.data[0];
        const outUrl = typeof outImage === 'string' ? outImage : outImage?.url;

        if (outUrl) {
          const imgRes = await fetch(outUrl);
          const arrayBuffer = await imgRes.arrayBuffer();
          b64 = Buffer.from(arrayBuffer).toString('base64');
        }
      } catch (apiError) {
        console.error('IDM-VTON API failed:', apiError.message);
        console.log('Falling back to a mock response so the UI works.');
        
        const fallbackData = fs.readFileSync(personFile.path);
        b64 = fallbackData.toString('base64');
        isMock = true;
      }
    }

    if (!b64 && !url) {
      const err = new Error('Try-on API missing image data');
      err.statusCode = 502;
      throw err;
    }

    res.json({
      success: true,
      data: {
        imageBase64: b64 ? `data:image/jpeg;base64,${b64}` : null,
        imageUrl: url,
        isMock,
        model,
        size,
      },
    });
  } catch (error) {
    console.error('Try-on error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  } finally {
    // Clean up temporary files
    if (req.files?.person?.[0]) fs.unlink(req.files.person[0].path, () => {});
    if (req.files?.garment?.[0]) fs.unlink(req.files.garment[0].path, () => {});
  }
};
