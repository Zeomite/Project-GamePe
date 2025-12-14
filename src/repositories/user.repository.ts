import { User, IUser } from '../models/user.model';

export class UserRepository {
  async create(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  async updateById(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async deleteById(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  }
}

