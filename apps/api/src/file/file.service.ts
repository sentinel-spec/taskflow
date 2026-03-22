import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export interface UploadedFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class FileService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      port: Number(this.configService.get<string>('MINIO_PORT')),
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ROOT_USER')!,
      secretKey: this.configService.get<string>('MINIO_ROOT_PASSWORD')!,
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET')!;
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created.`);
      }
    } catch (error) {
      this.logger.error(
        `Error connecting to MinIO: ${(error as Error).message}`,
      );
    }
  }

  async uploadFile(file: UploadedFile, folder: string = 'avatars') {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return fileName;
  }

  getFileUrl(fileName: string) {
    const publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');
    return `${publicUrl}/${this.bucketName}/${fileName}`;
  }
}
