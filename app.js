const logger = require('azure-logger');
const program = require('commander');

function displayEntry(entry) {
  console.log(JSON.stringify(entry, null, '\t'));
}

console.log(' *** azure logger CLI ***');

program
  .version('1.0.0')
  .option('-a, --account <accountName>', 'Azure storage account name')
  .option('-k, --key <key>', 'Storage key')
  .option('-t, --table <table>', 'Table name')
  .option('-s, --search <search>', 'Search string')
  .parse(process.argv);

const account = program.account || process.env.AZURE_STORAGE_ACCOUNT;
const key = program.key || process.env.AZURE_STORAGE_KEY;

if (!account || !key) {
  console.log('You must specify the --account [or AZURE_STORAGE_ACCOUNT env var] and --key [or AZURE_STORAGE_KEY env var]');
  console.log('Exiting...');
}
else {
  const options = {
    cred: {
      accountName: account,
      accountKey: key
    }
  };

  if (program.table) {
    options.table = program.table;
  }

  logger.get(options, function (err, entries) {
    var i;
    for (i = 0; i < entries.length; i++) {
      displayEntry(entries[i]);
    }
  });
}