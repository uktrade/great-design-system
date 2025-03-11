export const copyURLToClipboard = async () => {
  try {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    console.log("URL copied");
  } catch (error) {
    console.error("Failed to copy URL: ", error);
  }
};
