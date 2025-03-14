export const copyURLToClipboard = async () => {
  try {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.error("Failed to copy URL: ", error);
  }
};
