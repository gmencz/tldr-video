import { Configuration, OpenAIApi } from "openai";

const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable not set");
}

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function generateTranscriptTLDR(transcript: string) {
  const prompt = `Text: ${transcript}\nTLDR:`;
  const response = await openai.createCompletion({
    model: "text-curie-001",
    prompt,
    temperature: 0,
    max_tokens: 64,
  });

  return response.data.choices[0].text?.trim();
}
