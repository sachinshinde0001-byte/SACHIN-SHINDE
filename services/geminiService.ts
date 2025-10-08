import { GoogleGenAI, Type } from "@google/genai";
import { CartoonIdea, Scene } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const cartoonIdeaBaseSchema = {
    title: {
      type: Type.STRING,
      description: "A catchy and fun title for the cartoon video.",
    },
    logline: {
      type: Type.STRING,
      description: "A one-sentence summary of the cartoon's plot.",
    },
    characters: {
      type: Type.ARRAY,
      description: "A list of 2-3 characters in the story.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The character's name.",
          },
          description: {
            type: Type.STRING,
            description: "A brief description of the character's personality and appearance.",
          },
          visual_prompt: {
            type: Type.STRING,
            description: "A detailed visual prompt for an AI image generator to create this character. E.g., 'A small, fluffy blue monster with big googly eyes, holding a daisy, digital art, vibrant colors'.",
          },
        },
        required: ["name", "description", "visual_prompt"],
      },
    },
};

const cartoonScriptSchema = {
    scenes: {
      type: Type.ARRAY,
      description: "A list of scenes that make up the cartoon script.",
      items: {
        type: Type.OBJECT,
        properties: {
          scene_number: {
            type: Type.INTEGER,
            description: "The sequential number of the scene.",
          },
          setting: {
            type: Type.STRING,
            description: "Description of the scene's location and time. E.g., 'A sunny meadow - DAY'.",
          },
          action: {
            type: Type.STRING,
            description: "Description of what is happening in the scene and the characters' actions.",
          },
          dialogue: {
            type: Type.STRING,
            description: "The dialogue spoken by the characters in the scene. Format as 'CHARACTER: Line of dialogue.'",
          },
        },
        required: ["scene_number", "setting", "action", "dialogue"],
      },
    },
    music_suggestions: {
      type: Type.ARRAY,
      description: "A list of 2-3 suggestions for background music that would fit the cartoon's mood. E.g., 'Upbeat and quirky ukulele music', 'Gentle and magical orchestral score'.",
      items: {
        type: Type.STRING,
      },
    },
    moral: {
        type: Type.STRING,
        description: "A short, positive moral or lesson that the story teaches. E.g., 'Sharing with friends makes everything more fun!'"
    }
};


export const generateCartoonIdea = async (prompt: string, language: string): Promise<CartoonIdea> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate the initial concept for a short YouTube cartoon in the ${language} language. The user's idea is: "${prompt}". Create a title, a logline, and 2-3 character descriptions. All output text must be in ${language}. The target audience is young children, so keep the concept simple, fun, and positive.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: cartoonIdeaBaseSchema,
            required: ["title", "logline", "characters"],
        },
      },
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("API returned an empty response. The prompt might be unsafe or the model failed.");
    }

    return JSON.parse(text) as CartoonIdea;
  } catch (error) {
    console.error("Error generating cartoon idea:", error);
    throw new Error("Failed to generate the cartoon concept. The model might be unavailable or the request failed.");
  }
};

export const generateScriptFromIdea = async (idea: CartoonIdea, language: string): Promise<{ scenes: Scene[]; music_suggestions: string[]; moral: string }> => {
    try {
        const characterDescriptions = idea.characters.map(c => `${c.name}: ${c.description}`).join('\n');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following cartoon concept, write a complete script in the ${language} language.
            
            Title: ${idea.title}
            Logline: ${idea.logline}
            Characters:
            ${characterDescriptions}

            Your task is to create:
            1. A script with 3-5 scenes, including settings, actions, and character dialogues.
            2. 2-3 suggestions for background music.
            3. A simple, positive moral for the story.
            
            The entire output must be in ${language} and conform to the JSON schema. The tone should be fun and suitable for kids.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: cartoonScriptSchema,
                    required: ["scenes", "music_suggestions", "moral"]
                }
            }
        });

        const text = response.text.trim();
        if (!text) {
            throw new Error("API returned an empty script. The concept might be unsafe or the model failed.");
        }
        return JSON.parse(text);

    } catch (error) {
        console.error("Error generating script:", error);
        throw new Error("Failed to generate the script from the idea. Please try again.");
    }
};

export const parseScriptToCartoonIdea = async (script: string, language: string): Promise<CartoonIdea> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following cartoon script provided by the user, which is in the ${language} language. Your task is to extract all key information and structure it into a valid JSON object based on the provided schema. 
      
      Instructions:
      1.  **title**: Identify the title of the story from the script. If not explicitly stated, create a suitable one.
      2.  **logline**: Write a concise, one-sentence summary of the main plot.
      3.  **characters**: Identify all characters. For each character, provide their name, a brief description of their personality and role, and a detailed "visual_prompt" for an AI image generator (e.g., 'A curious red fox with a fluffy tail wearing a small backpack, 3D animation style').
      4.  **scenes**: Break down the script into scenes. For each scene, provide the scene number, the setting, a description of the action, and the exact dialogue spoken.
      5.  **music_suggestions**: Suggest 2-3 appropriate background music styles (e.g., 'Playful and lighthearted orchestral music').
      6.  **moral**: Identify the moral of the story. If not explicit, infer a suitable one.
      
      The entire output must be in ${language} and conform strictly to the JSON schema.

      User's script:
      ---
      ${script}
      ---`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: { ...cartoonIdeaBaseSchema, ...cartoonScriptSchema },
            required: ["title", "logline", "characters", "scenes", "music_suggestions", "moral"],
        },
      },
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("API returned an empty response. The script might be invalid, unsafe, or the model failed.");
    }

    return JSON.parse(text) as CartoonIdea;
  } catch (error) {
    console.error("Error parsing script:", error);
    throw new Error("Failed to analyze the script. Please check the script format or try again.");
  }
};


export const generateCharacterImage = async (prompt: string, aspectRatio: string): Promise<{ url: string; base64: string }> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `${prompt}, 3d animation style, character design, for a kids cartoon, vibrant colors, white background`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return {
                url: `data:image/png;base64,${base64ImageBytes}`,
                base64: base64ImageBytes
            };
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating character image:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.toLowerCase().includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("Image generation failed due to API quota limits. Please check your billing details.");
        }
        throw new Error("Failed to generate character image.");
    }
};

export const generateStoryVideo = async (idea: CartoonIdea): Promise<string> => {
    try {
        const characterNames = idea.characters.map(c => c.name).join(' and ');
        const storySummary = idea.scenes?.map(s => s.action).join('. ') || idea.logline;
        // Fix: Changed undefined variable `summary` to `storySummary`.
        const prompt = `Create a short, animated cartoon video based on this story: ${idea.logline}. The main characters are ${characterNames}. The story involves: ${storySummary}. The moral of the story is '${idea.moral}'. 3D animation style for a kids cartoon, vibrant colors.`;

        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
              numberOfVideos: 1
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        const videoObjectUrl = URL.createObjectURL(videoBlob);
        
        return videoObjectUrl;

    } catch (error) {
        console.error("Error generating story video:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.toLowerCase().includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("Video generation failed due to API quota limits. Please check your billing details.");
        }
        throw new Error("Failed to generate the story video. This is an experimental feature and may fail.");
    }
};

export const generateVideoFromImage = async (base64Image: string, prompt: string): Promise<string> => {
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: base64Image,
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        const videoObjectUrl = URL.createObjectURL(videoBlob);
        
        return videoObjectUrl;

    } catch (error) {
        console.error("Error generating video from image:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.toLowerCase().includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("Video generation failed due to API quota limits. Please check your billing details.");
        }
        throw new Error("Failed to generate the video from the image. This is an experimental feature and may fail.");
    }
};

export const suggestCartoonIdea = async (language: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest a single, creative, and fun cartoon idea suitable for young children. The idea should be a short phrase or sentence, no more than 15 words. Provide the response in the ${language} language.`,
        });
        const text = response.text.trim();
        if (!text) {
            throw new Error("API returned an empty suggestion.");
        }
        return text;
    } catch (error) {
        console.error("Error suggesting cartoon idea:", error);
        throw new Error("Failed to get a suggestion from the AI.");
    }
};

export const translateText = async (content: object | string, targetLanguageName: string): Promise<any> => {
    try {
        const isObject = typeof content === 'object' && content !== null;
        const contentToTranslate = isObject ? JSON.stringify(content, null, 2) : content;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a professional translator specializing in fun, natural, and kid-friendly content.
            Translate the following content from English to ${targetLanguageName}.

            - If the input is a JSON object, translate all string values. Maintain the exact JSON structure and keys.
            - If the input is a simple string, provide only the direct translation.
            - The tone must be simple, friendly, and easy for children to understand.

            Content to translate:
            ---
            ${contentToTranslate}
            ---

            Return ONLY the translated content, either as a valid JSON object or a plain string, exactly as requested. Do not add any commentary or extra formatting like markdown backticks.`,
        });

        let text = response.text.trim();
        
        if (text.startsWith('```json')) {
            text = text.substring(7, text.length - 3).trim();
        } else if (text.startsWith('```')) {
            text = text.substring(3, text.length - 3).trim();
        }

        if (!text) {
            throw new Error("API returned an empty response for translation.");
        }
        
        if (isObject) {
            return JSON.parse(text);
        }
        return text;

    } catch (error) {
        console.error(`Error translating content to ${targetLanguageName}:`, error);
        if (error instanceof SyntaxError) {
             console.error("Failed to parse translated JSON. The model may have returned an invalid format.");
        }
        throw new Error(`Failed to translate content to ${targetLanguageName}.`);
    }
}

export const translateCartoonIdea = async (idea: CartoonIdea, targetLanguageName: string): Promise<CartoonIdea> => {
    const translatableContent = {
        title: idea.title,
        logline: idea.logline,
        characters: idea.characters.map(c => ({ name: c.name, description: c.description })),
// Fix: Add optional chaining to prevent error if idea.scenes is undefined.
        scenes: idea.scenes?.map(s => ({ setting: s.setting, action: s.action, dialogue: s.dialogue })),
        music_suggestions: idea.music_suggestions,
        moral: idea.moral,
    };

    try {
        const translated = await translateText(translatableContent, targetLanguageName);

        return {
            ...idea,
            title: translated.title || idea.title,
            logline: translated.logline || idea.logline,
            characters: idea.characters.map((c, i) => ({
                ...c,
                name: translated.characters?.[i]?.name || c.name,
                description: translated.characters?.[i]?.description || c.description,
            })),
// Fix: Add optional chaining to prevent error if idea.scenes is undefined.
            scenes: idea.scenes?.map((s, i) => ({
                ...s,
                setting: translated.scenes?.[i]?.setting || s.setting,
                action: translated.scenes?.[i]?.action || s.action,
                dialogue: translated.scenes?.[i]?.dialogue || s.dialogue,
            })),
            music_suggestions: translated.music_suggestions || idea.music_suggestions,
            moral: translated.moral || idea.moral,
        };
    } catch (e) {
        console.error("Falling back to original cartoon idea due to translation error.", e);
        return idea;
    }
}