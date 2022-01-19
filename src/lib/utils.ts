export async function waitFor(duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}
