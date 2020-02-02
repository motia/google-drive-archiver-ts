import { SemangoArchiver } from '../archiver'

const sa = new SemangoArchiver()

sa.init();
sa.uploadNewBackup().then(() => {
  process.exit();
});
