import { SemangoArchiver } from '../archiver'

const sa = new SemangoArchiver()

sa.init();
sa.deleteOldBackups().then(() => {
  process.exit();
});
