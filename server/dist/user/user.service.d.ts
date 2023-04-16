import { Repository } from 'typeorm';
import { User } from './models/user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    all(): Promise<User[]>;
    create(data: any): Promise<User>;
    findOne(condit: any): Promise<User>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<any>;
}
