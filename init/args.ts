import yargs from 'yargs';

interface Args {
	noGUI?: boolean;
	dev?: boolean;
}

export default function (argv: any): Args {
	const args = yargs(argv).boolean('noGUI').boolean('dev').argv;
	return args;
}
