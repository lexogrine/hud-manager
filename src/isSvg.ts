const regex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*\s*(?:\[?(?:\s*<![^>]*>\s*)*\]?)*[^>]*>\s*)?(?:<svg[^>]*>[^]*<\/svg>|<svg[^/>]*\/\s*>)\s*$/i;

export default (img: Buffer) =>
	regex.test(
		img
			.toString()
			.replace(/\s*<!Entity\s+\S*\s*(?:"|')[^"]+(?:"|')\s*>/gim, '')
			.replace(/<!--([\s\S]*?)-->/g, '')
	);
