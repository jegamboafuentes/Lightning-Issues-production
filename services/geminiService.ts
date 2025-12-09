import { GoogleGenAI } from "@google/genai";
import { IssueSuggestion, IssueType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  const prompt = `
    I have a GitHub repository at: ${repoUrl}
    
    Please analyze this repository. 
    1. Use Google Search to understand what this repository does, its main technologies, and if there are any common known issues or missing obvious features.
    2. Search specifically for "issues site:github.com/${repoInfo.owner}/${repoInfo.name}" to see existing problems.
    ${scanTodos ? '3. Search for TODO/FIXME comments in the code as requested.' : '3. Suggest 3 distinct issues that could be created for this repository.'}
    
    ${specificInstructions}

    For each suggestion, provide:
    - A clear, professional Title.
    - A very detailed Body in GitHub-flavored Markdown. 
    - The type of issue (Bug, Feature, Refactor, Documentation).
    - A short reasoning.

    CRITICAL INSTRUCTION:
    If Google Search returns NO information (e.g. the repo is new, empty, or not indexed), DO NOT refuse to answer. 
    Instead, generate 3 generic, high-quality "best practice" issue suggestions that would apply to almost any open-source project. 
    Examples of fallback suggestions: "Add a Comprehensive README", "Set up GitHub Actions for CI", "Add Contribution Guidelines", "Create Issue Templates".
    
    IMPORTANT OUTPUT FORMAT:
    You must return a valid JSON array.
    Do not wrap the JSON in markdown code blocks.
    Start the response with '[' and end with ']'.
    Do not include any conversational text like "I attempted to analyze..." or "Here are the suggestions".

    Example:
    [
      {
        "title": "Example Title",
        "body": "Example Body",
        "type": "Feature",
        "reasoning": "Reasoning here"
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