import { IUsersServices } from './interfaces/IUsersServices';
import UsersRepository from '../repository/UsersRepository';
import { User } from '../model/users';

class UsersServices implements IUsersServices {
	async getAll(): Promise<User[]> {
		return await UsersRepository.getAll();
	}

	async getById(id: string): Promise<User | null> {
		return await UsersRepository.getById(id);
	}

	async getByAuthUid(uid: string): Promise<User | null> {
		const users = await UsersRepository.getAll();
		return users.find(u => u.uid === uid) ?? null;
	}

	async create(user: Partial<User>): Promise<string> {
		return await UsersRepository.create(user);
	}

	async update(id: string, data: Partial<User>): Promise<void> {
		return await UsersRepository.update(id, data);
	}

	async delete(id: string): Promise<void> {
		return await UsersRepository.delete(id);
	}
}

export default new UsersServices();

