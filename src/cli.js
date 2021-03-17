const {program} = require('commander');
const fs = require('fs');
const path = require('path');
const optimize = require('./index');

const isDirectory = (file) => {
  try {
    const stat = fs.statSync(file);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
};

const run = async (args, opts) => {
  if (args.length === 0) {
    return program.help();
  }

  let output;
  if (opts.output) {
    if (opts.output.length === 1 && isDirectory(opts.output[0])) {
      output = new Array(args.length).fill(opts.output[0]);
    } else {
      output = opts.output.concat(args.slice(opts.output.length));
    }
  } else {
    output = args;
  }

  for (let i = 0; i < args.length; i++) {
    const inputFile = path.resolve(args[i]);
    let outputFile = path.resolve(output[i]);
    if (isDirectory(outputFile)) {
      outputFile = path.join(outputFile, path.basename(inputFile));
    }

    console.log(`Optimizing ${inputFile} to ${outputFile}...`);
    const start = Date.now();
    const inputContents = fs.readFileSync(inputFile);
    const optimized = await optimize(inputContents);
    const end = Date.now();
    console.log(`Optimized in ${end - start}ms`);

    const inputLength = inputContents.byteLength;
    const outputLength = optimized.byteLength;
    console.log(`Input size: ${inputLength} Output size: ${outputLength} (-${100 - Math.round(outputLength / inputLength * 100)}%)`);
    if (outputLength > inputLength) {
      console.warn('Output is larger than input; skipping');
      continue;
    }

    fs.writeFileSync(outputFile, Buffer.from(optimized));
  }
};

program
  .arguments('[files...]')
  .option('-o, --output <output...>')
  .action((args, opts) => {
    run(args, opts)
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  });

program.parse();
