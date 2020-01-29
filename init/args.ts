import yargs from 'yargs';

interface Args {
    noGui: boolean;
}

export default function (argv): Args {
    const args = yargs(argv).boolean("noGui").argv;
    return args;
}