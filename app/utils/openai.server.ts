import { Configuration, OpenAIApi } from "openai";
import chunkText from "chunk-text";

const { OPENAI_API_KEY } = process.env;
if (typeof OPENAI_API_KEY !== "string") {
  throw new Error("OPENAI_API_KEY environment variable not set");
}

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function generateTextTLDR(text: string) {
  const maxChunkSize = 5000;
  if (text.length <= maxChunkSize) {
    const prompt = `Write a short TLDR of the following text from a video:\n\n"""\n${text}\n"""\n\nTLDR:\n`;
    const response = await openai.createCompletion({
      model: "text-curie-001",
      prompt,
      temperature: 0.7,
      max_tokens: 256,
    });

    return response.data.choices[0].text?.trim()!;
  } else {
    // 1. Split the large text into smaller chunks that GPT-3 can process
    const textChunks = chunkText(text, maxChunkSize);

    // 2. Write a short TLDR for each chunk with GPT-3
    const chunksTLDRs = await Promise.all(
      textChunks.map(async (textChunk) => {
        const prompt = `Write a short TLDR of the following text from a video:\n\n"""\n${textChunk}\n"""\n\nTLDR:\n`;
        const response = await openai.createCompletion({
          model: "text-curie-001",
          prompt,
          temperature: 0.7,
          max_tokens: 256,
        });

        return response.data.choices[0].text?.trim()!;
      })
    );

    // 3. Merge all of the chunks into one
    const mergedTLDRs = chunksTLDRs.reduce((acc, chunkTLDR) => {
      return acc + chunkTLDR + "\n\n";
    }, "");

    // 4. Write a TLDR for all of the chunks
    const prompt = `Write a short TLDR which sums up the following TLDRs:\n\n"""\n${mergedTLDRs}\n"""\n\nTLDR:\n`;
    const response = await openai.createCompletion({
      model: "text-curie-001",
      prompt,
      temperature: 0.7,
      max_tokens: 256,
    });

    return response.data.choices[0].text?.trim()!;
  }
}
