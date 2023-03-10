import { validateURL as ytdlValidateURL, getBasicInfo } from "ytdl-core";
import YoutubeTranscript from "youtube-transcript";

export function validateYoutubeVideoURL(url: string) {
  return ytdlValidateURL(url);
}

export function getYoutubeVideoInfo(url: string) {
  return getBasicInfo(url);
}

export async function getYoutubeVideoTranscript(url: string) {
  const transcriptResponses = await YoutubeTranscript.fetchTranscript(url);
  return transcriptResponses
    .map((transcriptResponse) => transcriptResponse.text)
    .join(" ");
}
