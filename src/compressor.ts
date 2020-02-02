import * as archiver from 'archiver'
import { DriveFile, DriveAdapter } from "./drive";
import { EntryData, Archiver } from "archiver";
import { Writable } from "stream";

export class Compressor {
  private readonly PARALLEL_JOBS = 5;
  private archive: Archiver;
  private queue: DriveFile[] = [];
  private currentlyWorking = 0;
  private processedFiles = 0;
  private filesCount = 0;
  private shouldFinalize: boolean = false;

  constructor(
    private drive: DriveAdapter,
    private output: Writable,
    private onComplete: () => void
  ) {
    this.archive = archiver('tar', {
      // options for ZIP compression
      zlib: { level: 9 },

      // options for TAR GZ compression
      gzip: true,
      gzipOptions: { level: 9 },
    });

    this.archive.on('entry', (entry: EntryData) => {
      if (this.currentlyWorking < this.PARALLEL_JOBS) {
        const temp = this.queue.shift();
        if (temp) {
          this.downloadAndArchive(temp);
        }
      }
      this.processedFiles++;

      if (this.shouldFinalize && this.processedFiles >= this.filesCount) {
        this.archive.finalize();
      }
      // console.log('--- added entry', entry);
    });
    

    this.output.on('finish', () => {
      console.log('--------FINISH')
    })
    

    this.output.on('close', () => {
      console.log(this.archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      // this.onComplete();
    });
    
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    this.archive.on('warning', function(err: { code: string }) {
      console.log('WARNING', err)

      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });
    
    // good practice to catch this error explicitly
    this.archive.on('error', function(err: Error) {
      throw err;
    });
    
    this.archive.pipe(output);
  }

  enqueue(file: DriveFile) {
    this.filesCount++;
    if (
      this.currentlyWorking < this.PARALLEL_JOBS
    ) {
      this.downloadAndArchive(file);
    } else {
      this.queue.push(file);
    }
  }

  private async downloadAndArchive(file: DriveFile) {
    this.archive.append(await this.drive.downloadFile(file), { name: file.path });
    this.currentlyWorking++;
  }

  finalize() {
    this.shouldFinalize = true;
  }
}