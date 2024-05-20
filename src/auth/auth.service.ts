/*
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from "typeorm";
import { Reset } from './models/password_reset.entity';
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Reset) private readonly userRepository: Repository<Reset>,
        ) {}

        async allReset() : Promise<Reset[]> {
            return this.userRepository.find();
        }

        async createReset(data) : Promise<Reset> {
            const u = this.userRepository.save(data)
            console.log('Create user :', await u)
            return u
        }
        
        async findOneReset(condit): Promise<Reset> {
            return this.userRepository.findOne({where: condit})
        }

        async updateReset(id: number, data: QueryPartialEntity<Reset>) : Promise<UpdateResult> {
            return this.userRepository.update(id, data)
        }

        async deleteReset(id: number): Promise<any> {
            //return this.userRepository.delete(id);
            console.log("Deleting user ", id)
            this.userRepository.createQueryBuilder('user').delete().from(Reset).where("id = id", {id: id}).execute()
        }
        

    }*/
