import { ArchiveUploader } from "../uploader";
import { loadProjectConfig } from "../config";

const projectConfig = loadProjectConfig()

const u = new ArchiveUploader(
  {
    ...projectConfig.s3,
    backUpCount: projectConfig.backUpCount,
    archivePrefix: projectConfig.archivePrefix,
  },
);

u.listOldArchives();
