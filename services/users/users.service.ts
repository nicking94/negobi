import { User } from '@/app/dashboard/users/page';
import * as UserRoutes from './user.routes';
import api from '@/utils/api';
import { OrganizationQueryType } from '@/types';

export class UsersService {
    static postUser(data: User) {
        return api.post(UserRoutes.postUser, data);
    }

    static getUsers(data: OrganizationQueryType) {
        return api.get(UserRoutes.getUsers, { params: data });
    }

    static patchUser(id: string, data: Partial<User>) {
        return api.patch(`${UserRoutes.patchUser}/${id}`, data);
    }

    static deleteUser(id: string) {
        return api.delete(`${UserRoutes.deleteUser}/${id}`);
    }
}