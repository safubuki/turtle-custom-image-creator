// --- 画像圧縮ロジック ---
// アップロード画像を縮小・JPEG化して IndexedDB の肥大化を防ぐ。

export const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.7,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('ファイルの読み込みに失敗しました'));
        return;
      }

      const img = new Image();
      img.src = result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas コンテキストを取得できませんでした'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    };

    reader.onerror = () => reject(reader.error);
  });
