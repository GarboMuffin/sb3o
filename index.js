const fs = require('fs');
const optimize = require('./src/index');

console.time('optimize');
const input = fs.readFileSync('test.sb3');
optimize(input, {

})
  .then((r) => {
    fs.writeFileSync('test-minimized.sb3', Buffer.from(r));
    console.log(r);
    console.log(`input: ${input.byteLength}  output: ${r.byteLength}`);
    console.timeEnd('optimize');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
