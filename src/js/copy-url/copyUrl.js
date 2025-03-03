export const copyUrlToClipboard = async (event) => {
  try {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.log(error);
  }
};
