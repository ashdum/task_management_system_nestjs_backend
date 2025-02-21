// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    // Find all users
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    // Find user by ID
    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    // Find user by email
    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }

    // Update user
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // Create a mutable copy of updateUserDto
        const mutableDto = { ...updateUserDto };

        // If email is being updated, check for uniqueness
        if (mutableDto.email && mutableDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: mutableDto.email },
            });
            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
        }

        // If password is being updated, hash it
        if (mutableDto.password) {
            mutableDto.password = await bcrypt.hash(mutableDto.password, 10);
        }

        // Update user fields
        Object.assign(user, mutableDto);
        return this.userRepository.save(user);
    }

    // Delete user
    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
}