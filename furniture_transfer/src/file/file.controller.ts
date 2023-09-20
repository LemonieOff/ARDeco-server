import { Controller, Get, Param, Res, NotFoundException, Post, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { diskStorage } from 'multer';
import { promisify } from 'util';
import * as mimeTypes from 'mime-types'

@Controller('files')
export class FileController {
    @Get('get/:filename')
    async getFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = `./uploads/${filename}`;

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException(`File ${filename} don't exist`);
        }

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const timestamp = new Date().toISOString().replace(/:/g, '-');
                    const filename = `${timestamp}-${file.originalname}`;
                    cb(null, filename);
                },
            }),
        }),
    )
    async uploadFile(@UploadedFile() file) {
        return {
            status: 'OK',
            code: 201,
            filename: file.filename,
            description: `File ${file.filename} was download without problem`,
        };
    }

    @Get('list')
    async getFiles() {
        const readdirAsync = promisify(fs.readdir);
        const directoryPath = './uploads';

        try {
            const files = await readdirAsync(directoryPath);
            return { files };
        } catch (error) {
            throw new Error('Internal error');
        }
    }

    @Delete(':filename')
    async deleteFile(@Param('filename') filename: string) {
        const filePath = `./uploads/${filename}`;

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException(`File ${filename} don't exist`);
        }

        try {
            fs.unlinkSync(filePath);
            return { message: 'File removed.' };
        } catch (error) {
            throw new Error(`File ${filename} don't exist or couldn't be removed`);
        }
    }

}