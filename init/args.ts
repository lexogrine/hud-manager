import yargs from 'yargs';

interface Args {
    noGui: boolean;
    dev: boolean;
}

export default function (argv): Args {
    const args = yargs(argv).boolean("noGui").boolean("dev").argv;
    return args;
}