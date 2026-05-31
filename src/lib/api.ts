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

/** HTTP ステータスから日本語の分かりやすいメッセージを組み立てる */
const friendlyMessage = (status: number, apiMessage?: string): string => {
  switch (status) {
    case 429:
      return (
        'APIの利用上限（クォータ）に達しました。\n' +
        '画像生成は無料枠では使えないことが多く、その場合は Google AI Studio / Google Cloud で' +
        '請求（課金）を有効化する必要があります。一時的な制限の場合は、しばらく待ってから再度お試しください。'
      );
    case 403:
      return 'アクセスが拒否されました。APIキーが無効か、このモデルの利用権限がない可能性があります。設定のAPIキー・モデル名をご確認ください。';
    case 404:
      return 'モデルが見つかりません。設定の「AIモデル」でモデル名をご確認ください。';
    case 400:
      return `リクエストに問題があります: ${apiMessage || '入力内容をご確認ください'}`;
    default:
      return `エラー: ${status} - ${apiMessage || '不明なエラー'}`;
  }
};

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
): Promise<FetchJson> => {
  const delays = [1000, 2000, 4000];
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (networkError) {
      // ネットワークエラーのみリトライ対象
      lastError = networkError;
      if (i < retries - 1) {
        await wait(delays[i]);
        continue;
      }
      throw new Error(
        'ネットワークに接続できませんでした。通信環境をご確認ください。',
      );
    }

    if (response.ok) return (await response.json()) as FetchJson;

    const errorData = (await response.json().catch(() => ({}))) as FetchJson;
    const message = friendlyMessage(response.status, errorData.error?.message);

    // 4xx（クォータ超過・権限・不正リクエスト等）は待っても回復しないため即終了。
    // 無駄なリトライで残りのクォータを消費しないようにする。
    if (response.status < 500) {
      throw new Error(message);
    }

    // 5xx（サーバー側の一時障害）はリトライ
    lastError = new Error(message);
    if (i < retries - 1) {
      await wait(delays[i]);
    }
  }

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

/** 利用可能なモデル（ListModels の結果） */
export interface AvailableModel {
  /** "models/" を除いたモデル ID（設定欄にそのまま入れられる） */
  id: string;
  displayName?: string;
  /** 対応する生成メソッド（generateContent / predict など） */
  methods: string[];
}

interface ListModelsResponse {
  models?: Array<{
    name: string;
    displayName?: string;
    supportedGenerationMethods?: string[];
  }>;
  error?: { message?: string };
}

/**
 * APIキーで利用可能なモデルの一覧を取得する（一覧取得は無料）。
 * 画像生成に関係しそうなモデル（名前に image/imagen を含む、または predict 対応）に絞って返す。
 */
export const listModels = async (
  apiKey: string,
): Promise<AvailableModel[]> => {
  const key = requireKey(apiKey);
  let response: Response;
  try {
    response = await fetch(
      `${BASE_URL}?key=${encodeURIComponent(key)}&pageSize=1000`,
    );
  } catch {
    throw new Error(
      'ネットワークに接続できませんでした。通信環境をご確認ください。',
    );
  }
  if (!response.ok) {
    const data = (await response
      .json()
      .catch(() => ({}))) as ListModelsResponse;
    throw new Error(friendlyMessage(response.status, data.error?.message));
  }

  const data = (await response.json()) as ListModelsResponse;
  return (data.models ?? [])
    .map((m) => ({
      id: m.name.replace(/^models\//, ''),
      displayName: m.displayName,
      methods: m.supportedGenerationMethods ?? [],
    }))
    .filter(
      (m) =>
        m.id.includes('image') ||
        m.id.includes('imagen') ||
        m.methods.includes('predict'),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
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
