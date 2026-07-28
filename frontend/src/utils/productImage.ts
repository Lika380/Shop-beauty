const IMAGE_COUNT = 20;

export function getProductImage(id: number): string {
  const num = ((id - 1) % IMAGE_COUNT) + 1;
  return `${import.meta.env.BASE_URL}product-${String(num).padStart(2, '0')}.jpg`;
}
