var bcrypt = require('bcrypt-nodejs');
var usage = 'usage: node passwordgen.js <password>';

if (process.argv.length != 3) {
  console.log(usage);
  process.exit(1);
}

var plaintext = process.argv[2];
bcrypt.genSalt(10, function (err, salt) {
  bcrypt.hash(plaintext, salt, null, function (err, hash) {
    console.log(hash);
    process.exit(0);
  });
});
