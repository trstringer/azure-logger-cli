const logger = require('azure-logger');
const program = require('commander');
const packageConfig = require('./package.json');

// return:
//  true if entry displayed
//  false if entry not displayed
function displayEntry(entry, options) {
  if (options && options.local && entry && entry.Timestamp) {
    entry.Timestamp = new Date(entry.Timestamp).toLocaleString();
  }
  
  const entryString = JSON.stringify(entry, null, '\t');
  
  if (entryString) {
    if (options) {
      if (options.exclude && options.exclude !== '' && entryString.indexOf(options.exclude) > -1) {
        return false;
      }
      if (options.search && options.search !== '' && entryString.indexOf(options.search) === -1) {
        return false;
      }
    }
    
    console.log(entryString);
    return true;
  }
  else {
    return false;
  }
}

console.log(' *** azure logger CLI ***');

program
  .version(packageConfig.version)
  .option('-a, --account <accountName>', 'azure storage account name')
  .option('-k, --key <key>', 'storage key')
  .option('-t, --table <table>', 'table name')
  .option('-s, --search <search>', 'search string')
  .option('-f, --first <first>', 'top count to limit results', parseInt)
  .option('-x, --exclude <exclude>', 'exclude entries containing')
  .option('-l, --local', 'show local time')
  .option('-o, --order', 'order by date (default to asc)')
  .option('-d, --desc', 'order by date descending')
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
    
    const top = program.first || Number.MAX_SAFE_INTEGER;

    logger.get(options, function (err, entries) {
      if (entries && entries.length > 0) {
        if (program.order) {
          entries.sort((a, b) => {
            const date1 = program.desc ? new Date(b.Timestamp) : new Date(a.Timestamp);
            const date2 = program.desc ? new Date(a.Timestamp) : new Date(b.Timestamp);
            return date1 - date2;
          });
        }
        
        var i;
        var j = 0;
        const effectiveMax = top < entries.length ? top : entries.length;
        for (i = 0; i < effectiveMax; i++) {
          if (!displayEntry(entries[j], {
            search: program.search, 
            exclude: program.exclude,
            local: program.local
          })) {
            // if the entry wasn't displayed because it didn't match 
            // criteria so we need to do another iteration
            i--;
          }
          // always increment the indexing variable as we will always 
          // need to look at the next entry
          j++;
          
          // we need a hard stop so that we don't keep looping endlessly
          if (j > entries.length) {
            break;
          }
        }
      }
    });
  }
}