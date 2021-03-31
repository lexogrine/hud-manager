const copyToClipboard = (textToCopy: string) => {
	// navigator clipboard api needs a secure context (https)
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(textToCopy);
	}
	const textArea = document.createElement('textarea');
	textArea.value = textToCopy;
	textArea.style.display = 'none';
	textArea.style.position = 'fixed';
	textArea.style.left = '-999999px';
	textArea.style.top = '-999999px';
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	return new Promise<void>((res, rej) => {
		document.execCommand('copy') ? res() : rej();
		textArea.remove();
	});
};

export { copyToClipboard };
