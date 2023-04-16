import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        ) {}

        async all() : Promise<User[]> {
            return this.userRepository.find();
        }

        async create(data) : Promise<User> {
            const u = this.userRepository.save(data)
            console.log('Create user :', await u)
            return u
        }
        
        async findOne(condit): Promise<User> {
            return await this.userRepository.findOne({where: condit})
        }

        async update(id: number, data) : Promise<any> {
            return this.userRepository.update(id, data)
        }

        async delete(id: number): Promise<any> {
            return this.userRepository.delete(id);
        }

    }