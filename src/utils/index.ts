/**
 * Cleans email addresses by removing VMess-related suffixes
 * @param email - The email address potentially with VMess suffix
 * @returns Clean email address
 */
export const cleanEmailAddress = (email: string): string => {
  // Remove common VMess suffixes
  const suffixesToRemove = [
    "-VMess_WS",
    "-VMess_TCP",
    "-VMess_gRPC",
    "-VMess_HTTPUpgrade",
    "-VLESS_WS",
    "-VLESS_TCP",
    "-Trojan_WS",
    "-Trojan_TCP",
  ];

  let cleanEmail = email;
  for (const suffix of suffixesToRemove) {
    if (cleanEmail.endsWith(suffix)) {
      cleanEmail = cleanEmail.replace(suffix, "");
      break;
    }
  }

  return cleanEmail;
};

/**
 * Formats file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Copies text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error(err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (fallbackErr) {
      console.error("Failed to copy text to clipboard:", fallbackErr);
      throw fallbackErr;
    }
    document.body.removeChild(textArea);
  }
};
