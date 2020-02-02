const { Archiver } = require('./build/archiver')

exports.handler =  async function(event, context) {
  const s = new Archiver();

  // upload backup
  await s.uploadNewBackup();

  // once uploaded delete old backups
  await s.deleteOldBackups();

  return true;
}