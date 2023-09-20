import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as multer from 'multer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = express();

  // Configure Multer to store uploaded files in the 'uploads' directory
  const storage = multer.diskStorage({
    destination: './uploads',
    filename(req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage });

  app.use('/uploads', express.static('uploads')); // Serve uploaded files
  app.use('/api', expressApp);

  await app.listen(4000);
}
bootstrap();
