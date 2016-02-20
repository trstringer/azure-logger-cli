const logger = require('azure-logger');
const program = require('commander');
const packageConfig = require('./package.json');

function displayEntry(entry, options) {
  const entryString = JSON.stringify(entry, null, '\t');
  
  if (options) {
    if (options.exclude && options.exclude !== '' && entryString.indexOf(options.exclude) > -1) {
      return;
    }
    if (options.search && options.search !== '' && entryString.indexOf(options.search) === -1) {
      return;
    }
  }
  
  console.log(entryString);
}

console.log(' *** azure logger CLI ***');

program
  .version(packageConfig.version)
  .option('-a, --account <accountName>', 'Azure storage account name')
  .option('-k, --key <key>', 'Storage key')
  .option('-t, --table <table>', 'Table name')
  .option('-s, --search <search>', 'Search string')
  .option('-t, --top <top>', 'Top count to limit results', parseInt)
  .option('-x, --exclude <exclude>', 'Exclude entries containing')
  .parse(process.argv);
  
// check required param(s)
if (!program.table) {
  console.log('You must specify a table name with --table');
}
else {
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
        displayEntry(entries[i], {
          search: program.search, 
          exclude: program.exclude
        });
      }
    });
  }
}