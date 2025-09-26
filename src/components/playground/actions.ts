"use server";

import { generateCodeFromPrompt } from "@/ai/flows/generate-code-from-prompt";

export interface GenerateCodeState {
  code: string | null;
  error: string | null;
}

export async function generateCodeAction(
  prevState: GenerateCodeState,
  formData: FormData
): Promise<GenerateCodeState> {
  const prompt = formData.get("prompt") as string;
  if (!prompt || prompt.trim().length < 5) {
    return { code: null, error: "Please enter a more descriptive prompt." };
  }
  
  try {
    const result = await generateCodeFromPrompt({ prompt });
    return { code: result.code, error: null };
  } catch (error) {
    console.error(error);
    return {
      code: null,
      error: "Failed to generate code. Please try again later.",
    };
  }
}
