const {program} = require('commander');
const fs = require('fs');
const path = require('path');
const optimize = require('./index');

program
  .arguments('[files...]')
  .option('-o, --output <output...>')
  .action(async (args, opts, command) => {
    if (args.length === 0) {
      return program.help();
    }

    let output;
    if (opts.output) {
      output = opts.output.concat(args.slice(opts.output.length));
    } else {
      output = args;
    }

    for (let i = 0; i < args.length; i++) {
      const inputFile = path.resolve(args[i]);
      const outputFile = path.resolve(output[i]);
      console.log(`Optimizing ${inputFile} to ${outputFile}`);
      const optimized = await optimize(fs.readFileSync(inputFile));
      fs.writeFileSync(outputFile, Buffer.from(optimized));
    }
  });

program.parse();
