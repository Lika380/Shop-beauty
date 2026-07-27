export function ErrorMessage({ message }: { message: string }) {
  return <div className="error-box" role="alert">{message}</div>;
}
