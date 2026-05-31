// --- 画像生成 API（Google Generative Language API） ---
// APIキーは引数で受け取る（コードへの直書きを廃止）。

import type { AssetImage, AspectRatio } from '../types';

/** APIキー未設定時に投げるエラー（呼び出し側で設定画面への誘導に利用） */
export class MissingApiKeyError extends Error {
  constructor() {
    super('APIキーが設定されていません。設定画面から登録してください。');
    this.name = 'MissingApiKeyError';
  }
}

interface FetchJson {
  error?: { message?: string };
  predictions?: Array<{ bytesBase64Encoded?: string }>;
  candidates?: Array<{
    content?: { parts?: Array<{ inlineData?: { data?: string } }> };
  }>;
}

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
): Promise<FetchJson> => {
  const delays = [1000, 2000, 4000];
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as FetchJson;
        throw new Error(
          `エラー: ${response.status} - ${errorData.error?.message || '不明なエラー'}`,
        );
      }
      return (await response.json()) as FetchJson;
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delays[i]));
      }
    }
  }

  // ループを抜けた = 全リトライ失敗
  throw lastError instanceof Error
    ? lastError
    : new Error('通信に失敗しました');
};

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const requireKey = (apiKey: string): string => {
  const trimmed = apiKey.trim();
  if (!trimmed) throw new MissingApiKeyError();
  return trimmed;
};

/** テキストから画像を生成（Imagen） */
export const generateTextToImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  apiKey: string,
  model: string,
): Promise<string> => {
  const key = requireKey(apiKey);
  const url = `${BASE_URL}/${model}:predict?key=${encodeURIComponent(key)}`;
  const payload = {
    instances: { prompt },
    parameters: { sampleCount: 1, aspectRatio },
  };

  const result = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const base64 = result.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error('画像が生成されませんでした。');
  return `data:image/png;base64,${base64}`;
};

/** 参照画像をもとに画像を生成（Gemini image） */
export const generateImageToImage = async (
  prompt: string,
  images: AssetImage[],
  aspectRatio: AspectRatio,
  apiKey: string,
  model: string,
): Promise<string> => {
  const key = requireKey(apiKey);
  const url = `${BASE_URL}/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [
    {
      text: `${prompt}\n[IMPORTANT: Generate a single unified image incorporating the referenced characteristics. Aspect ratio: ${aspectRatio}]`,
    },
  ];

  images.forEach((img) => {
    const cleanBase64 = img.base64.split(',')[1] || img.base64;
    parts.push({
      inlineData: {
        mimeType: img.mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });
  });

  const payload = {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };

  const result = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData,
  )?.inlineData?.data;

  if (!generatedBase64) {
    throw new Error('画像の生成に失敗しました。指示を見直してください。');
  }
  return `data:image/jpeg;base64,${generatedBase64}`;
};
