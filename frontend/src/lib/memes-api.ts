import { apiFetch } from "./api-client";

export interface Meme {
  id: string;
  title: string;
  image_url: string;
  alt_text: string;
  content_key: string;
}

export function fetchRandomMeme(): Promise<Meme> {
  return apiFetch<Meme>("/api/memes/random");
}
