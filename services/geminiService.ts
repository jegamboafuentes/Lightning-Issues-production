import { GoogleGenAI } from "@google/genai";
import { IssueSuggestion } from "../types";

// DEBUGGING LOGS
const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log("🔍 [DEBUG] Key Check:");
console.log("  - import.meta.env.VITE_GEMINI_API_KEY:", viteKey ? "Exists (starts with " + viteKey.substring(0, 4) + "...)" : "UNDEFINED");

const apiKey = viteKey || '';

if (!apiKey) {
  console.error("❌ [DEBUG] API Key is MISSING. App will likely crash or fail requests.");
} else {
  console.log("✅ [DEBUG] API Key found.");
}

const ai = new GoogleGenAI({ apiKey });
// --- FIX END ---

export const parseRepoUrl = (url: string): { owner: string; name: string } | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], name: parts[1] };
  } catch (e) {
    return null;
  }
};

export const generateIssueSuggestions = async (
  repoUrl: string, 
  projectGoals?: string, 
  scanTodos?: boolean
): Promise<IssueSuggestion[]> => {
  const repoInfo = parseRepoUrl(repoUrl);
  if (!repoInfo) {
    throw new Error("Invalid GitHub URL");
  }

  const model = "gemini-2.5-flash";
  
  // Construct the prompt based on optional inputs
  let specificInstructions = "";
  
  if (projectGoals && projectGoals.trim()) {
    specificInstructions += `\nThe user has specified the following Project Goals: "${projectGoals}". Please ensure at least one suggested issue aligns directly with these goals.\n`;
  }

  if (scanTodos) {
    specificInstructions += `\nCRITICAL INSTRUCTION: The user wants to scan for existing TODOs. Use Google Search to specifically look for "TODO", "FIXME" or "HACK" comments in the repository code (e.g. search query 'site:github.com/${repoInfo.owner}/${repoInfo.name} "TODO"'). If you find relevant TODOs, prioritize creating an issue to resolve them.\n`;
  }

  // expanded perspectives list for greater diversity
  const perspectives = [
    "Focus strictly on Code Quality: Identify potential refactoring opportunities, dead code, or complex functions that need simplification.",
    "Focus on User Experience (UX) & Accessibility: specific UI glitches, missing aria-labels, or mobile responsiveness issues.",
    "Focus on Performance: potential bottlenecks, large bundle sizes, unoptimized images, or slow database queries.",
    "Focus on Security: dependency vulnerabilities, hardcoded secrets (hypothetical check), or missing input validation.",
    "Focus on Documentation: missing examples, unclear contribution guidelines, or outdated API references.",
    "Focus on Edge Cases & Error Handling: places where the app might crash if an API fails or inputs are malformed.",
    "Focus on Developer Experience: missing scripts in package.json, lack of tests, or complex setup instructions.",
    "Focus on Modernization: upgrading old dependencies, switching to modern syntax (e.g., TS interfaces vs types), or adopting new framework features.",
    "Focus on Community Health: adding issue templates, code of conduct, or improving the README for new contributors.",
    "Focus on Testing: identifying areas that likely lack unit or integration test coverage."
  ];
  
  // Pick 2 random perspectives to combine for a unique angle
  const p1 = perspectives[Math.floor(Math.random() * perspectives.length)];
  const p2 = perspectives[Math.floor(Math.random() * perspectives.length)];
  const combinedPerspective = p1 === p2 ? p1 : `${p1} AND ${p2}`;
  const randomSeed = Date.now(); // Force variation

  const prompt = `
    I have a GitHub repository at: ${repoUrl}
    Analysis ID: ${randomSeed} (Use this to generate unique results different from previous runs)
    
    Please analyze this repository deeply acting as a Senior Staff Engineer.
    1. Use Google Search to understand what this repository does, its main technologies, architecture, and recent activity.
    2. Search specifically for "issues site:github.com/${repoInfo.owner}/${repoInfo.name}" to see existing problems and avoid duplicates.
    ${scanTodos ? '3. Search for TODO/FIXME comments in the code as requested.' : '3. Suggest 3 distinct, non-trivial, and highly specific issues.'}
    
    To ensure diversity and avoid generic responses, analyze the repo through this specific lens:
    "${combinedPerspective}"
    
    CRITICAL INSTRUCTIONS FOR DIVERSITY:
    - Do NOT suggest generic "Update README" or "Add CI" issues unless the repo is completely empty or you are specifically focusing on Community Health.
    - Look for *specific* technical improvements based on the language (e.g., if React, suggest Hooks optimization; if Python, suggest typing improvements).
    - If you cannot find deep code details via search, infer likely technical debt based on the project age and tech stack.
    - Make the issues sound like they were written by a developer who has read the code.

    ${specificInstructions}

    For each suggestion, provide:
    - A clear, professional Title.
    - A very detailed Body in GitHub-flavored Markdown. Include headers, code blocks where relevant, and a 'Tasks' list.
    - The type of issue. Choose from: Bug, Feature, Refactor, Documentation, Security, Performance, Accessibility, Testing, Chore, Design.
    - A short reasoning explaining why this is valuable.

    CRITICAL FALLBACK:
    If Google Search returns NO information (e.g. the repo is new, empty, or not indexed), DO NOT refuse to answer. 
    Instead, generate 3 generic, high-quality "best practice" issue suggestions that would apply to almost any open-source project, but TRY to tailor them to the likely language/tech stack if you can infer it.
    
    IMPORTANT OUTPUT FORMAT:
    You must return a valid JSON array.
    Do not wrap the JSON in markdown code blocks.
    Start the response with '[' and end with ']'.
    Do not include any conversational text like "I attempted to analyze..." or "Here are the suggestions".

    Example:
    [
      {
        "title": "Refactor [ComponentName] to use Composition Pattern",
        "body": "Detailed description...",
        "type": "Refactor",
        "reasoning": "Reduces complexity..."
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data received from AI");
    }

    // Robust JSON extraction
    let jsonStr = text.trim();
    
    // 1. Try to find the JSON array if there is extra text around it
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    } else {
      // If we can't find a JSON array block, and the text doesn't start with [, it's likely a conversational error.
      if (!jsonStr.startsWith('[')) {
        console.warn("AI returned non-JSON response:", text);
        // We throw a specific error so the UI can handle it or the user knows why.
        throw new Error("The AI provided a text response instead of specific issues. This usually happens for new or unindexed repositories. Please try again.");
      }
    }

    // 2. Clean up any markdown code blocks that might still be present
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');

    try {
      return JSON.parse(jsonStr) as IssueSuggestion[];
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw text:", text);
      throw new Error("Failed to parse AI response. Please try again.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("400")) {
       throw new Error("AI request failed. The repository might be private or inaccessible.");
    }
    throw new Error(error.message || "Failed to generate suggestions");
  }
};