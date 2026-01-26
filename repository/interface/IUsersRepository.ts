import { User } from '../../model/users';

export interface IUsersRepository {
	getAll(): Promise<User[]>;
	getById(id: string): Promise<User | null>;
	create(user: Partial<User>): Promise<string>;
	update(id: string, data: Partial<User>): Promise<void>;
	delete(id: string): Promise<void>;
}

