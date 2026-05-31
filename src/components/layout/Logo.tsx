// アプリのロゴ（public/icons/icon.svg）。
// 公開パス（GitHub Pages のサブパス）に追従するよう BASE_URL を前置する。
const LOGO_SRC = `${import.meta.env.BASE_URL}icons/icon.svg`;

export function Logo({ className }: { className?: string }) {
  return <img src={LOGO_SRC} alt="" className={className} />;
}
