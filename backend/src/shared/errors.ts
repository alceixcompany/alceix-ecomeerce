export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}
export const notFound = () =>
  new AppError(404, "NOT_FOUND", "Kayıt bulunamadı.");
export const conflict = (
  message = "Kayıt değişmiş olabilir. Yenileyip tekrar deneyin.",
) => new AppError(409, "CONFLICT", message);
export const unauthorized = () =>
  new AppError(401, "UNAUTHENTICATED", "Devam etmek için giriş yapın.");
export const unavailable = (message: string) =>
  new AppError(503, "UNAVAILABLE", message);
