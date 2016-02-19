const logger = require('azure-logger');
const program = require('commander');

function displayEntry(entry, search, exclude) {
  const entryString = JSON.stringify(entry, null, '\t');
  if (search && search !== '') {
    if (entryString.indexOf(search) > -1) {
      if (exclude && exclude !== '') {
        if (entryString.indexOf(exclude) > -1) {
          return;
        }
      }
      console.log(entryString);
    }
  } 
  else {
    if (exclude && exclude !== '') {
      if (entryString.indexOf(exclude) > -1) {
        return;
      }
    }
    console.log(entryString);
  }
}

console.log(' *** azure logger CLI ***');

program
  .version('1.0.0')
  .option('-a, --account <accountName>', 'Azure storage account name')
  .option('-k, --key <key>', 'Storage key')
  .option('-t, --table <table>', 'Table name')
  .option('-s, --search <search>', 'Search string')
  .option('-t, --top <top>', 'Top count to limit results', parseInt)
  .option('-x, --exclude <exclude>', 'Exclude entries containing')
  .parse(process.argv);

const account = program.account || process.env.AZURE_STORAGE_ACCOUNT;
const key = program.key || process.env.AZURE_STORAGE_ACCESS_KEY;

if (!account || !key) {
  console.log('You must specify the --account [or AZURE_STORAGE_ACCOUNT env var] and --key [or AZURE_STORAGE_ACCESS_KEY env var]');
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
  
  const top = program.top || Number.MAX_SAFE_INTEGER;

  logger.get(options, function (err, entries) {
    var i;
    const effectiveMax = top < entries.length ? top : entries.length;
    for (i = 0; i < effectiveMax; i++) {
      displayEntry(entries[i], program.search);
    }
  });
}