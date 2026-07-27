export function Loader({ label = 'Загрузка…' }: { label?: string }) {
  return <div className="loader">{label}</div>;
}
