// Real AI Engine Integrations using Google Gemini & Pollinations.ai
const fallbackLLM = (prompt) => {
  console.log("Mocking LLM Response for prompt:", prompt);
  if (prompt.includes("safety") || prompt.includes("compliance") || prompt.includes("OSHA")) {
    return {
      status: "needs_review",
      conflicts: [
        { requirement_id: "OSHA-1910", description: "Warning regarding high voltage glove certification is absent in Step 2.", severity: "high" }
      ],
      suggested_update: "Add hazard warning: 'Ensure high voltage gloves are inspected and certified prior to contact.'"
    };
  }
  if (prompt.includes("shadow")) {
    return {
      shadow_experts: [
        { user_id: "usr-operator", full_name: "John Doe", email: "john.doe@learnflow.industrial", knowledge_score: 85, certifications_held: 1, contributions: 6, verified_contributions: 3 }
      ],
      total: 1
    };
  }
  return {
    requirements: [
      { id: "REQ-GEN", type: "safety", description: "Wear all standard protective gear (helmet, goggles, safety shoes).", keywords: ["safety", "protective"], severity: "medium" }
    ],
    summary: "Safety regulation compliance analysis and training recommendations."
  };
};

const getCacheKey = (prompt, schema) => {
  return `lf_ai_cache_${btoa(unescape(encodeURIComponent(prompt + JSON.stringify(schema || {}))))}`;
};

export const InvokeLLM = async ({ prompt, response_json_schema, systemInstruction, model = 'gemini-1.5-flash' }) => {
  // Check local cache first to save tokens
  const cacheKey = getCacheKey(prompt, response_json_schema);
  const cachedResponse = localStorage.getItem(cacheKey);
  if (cachedResponse) {
    console.log("Using cached AI response.");
    return JSON.parse(cachedResponse);
  }

  // Get API key from localStorage or Vite environment variable
  const apiKey = localStorage.getItem('lf_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No Google Gemini API key configured. Using local fallback simulation.");
    return fallbackLLM(prompt);
  }

  try {
    const systemParam = systemInstruction ? `\nSystem Instruction: ${systemInstruction}\n` : '';
    const fullPrompt = `${systemParam}${prompt}`;

    const requestBody = {
      contents: [{ parts: [{ text: fullPrompt }] }]
    };

    // Configure structured JSON output schema if provided
    if (response_json_schema) {
      requestBody.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: response_json_schema
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const parsed = response_json_schema ? JSON.parse(textResponse) : textResponse;
    
    // Write to cache
    localStorage.setItem(cacheKey, JSON.stringify(parsed));
    return parsed;
  } catch (error) {
    console.error("Gemini API request failed. Falling back to local simulation:", error);
    return fallbackLLM(prompt);
  }
};

export const GenerateImage = async ({ prompt }) => {
  // Use pollinations.ai for free, keyless AI image generation based on user prompt
  const seed = Math.floor(Math.random() * 100000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}`;
};

export const UploadFile = async (file) => {
  // Returns a mock URL pointing to the file's object URL in memory
  return { url: URL.createObjectURL(file) };
};
