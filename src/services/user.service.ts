import { UserModel } from "../models/UserModel";
import { User, UserAdd, UserSort, UserUpdate } from "../types/User";
import { IResult, Result, SuccessResult, ErrorResult } from "../core/results/Result";
import { IDataResult, DataResult, SuccessDataResult, ErrorDataResult } from "../core/results/DataResult";
import Status from "../core/types/enums/Status";
import run from "../core/utils/business-runner";
import Roles from "../core/types/enums/Roles";

import EncryptionService from '../core/services/encryption.service';
import { PostModel } from "../models/PostModel";
import { TokenPayload } from "../core/types/TokenPayload";
import { Pagination } from "../core/types/Pagination";


async function getAll({ page, limit, sort, asc }: { page?: number, limit?: number, sort?: string, asc?: number }): Promise<IDataResult<Pagination<User>>> {

    const sortMethod = sort ? sort : "createdAt";
    const userSort = { [sortMethod]: asc ? asc : -1 };

    const query = { status: { $ne: Status.DELETED } };

    const count = await UserModel.countDocuments(query);

    const page_ = page ? page - 1 : 0;
    const limit_ = limit ? limit : count;

    const users: any = await UserModel
        .find(query)
        .sort(userSort)
        .skip(page_ * limit_)
        .limit(limit_);

    const paginatedUsers: Pagination<User> = { data: users, page: parseInt(page_ + 1 + ""), pageSize: parseInt(limit_ + ""), totalItems: count, totalPages: Math.ceil(count / limit_) }

    return new SuccessDataResult(paginatedUsers);
}

async function getById(id: string): Promise<DataResult<User | null>> {
    const res: Result = await run(
        [
            { function: isExists, args: [id] }
        ]
    );
    if (!res.status) {
        return new ErrorDataResult(null, res.message);
    }

    return new SuccessDataResult(await UserModel.findById(id));
}

async function getByUsername(username: string): Promise<IDataResult<User | null>> {
    const res: Result = await run(
        [
            { function: isExistsUsername, args: [username] }
        ]
    );
    if (!res.status) {
        return new ErrorDataResult(null, res.message);
    }
    const temp: any = await UserModel.findOne({ username: username, status: { $ne: Status.DELETED } });

    if (temp == null) {
        return new ErrorDataResult(null, "User not exits");
    }

    return new SuccessDataResult(temp);
}

async function getByEmail(email: string): Promise<IDataResult<User | null>> {
    const res: Result = await run(
        [
            { function: isExistsEmail, args: [email] }
        ]
    );
    if (!res.status) {
        return new ErrorDataResult(null, res.message);
    }
    const temp: any = await UserModel.findOne({ email: email, status: { $ne: Status.DELETED } });

    if (temp == null) {
        return new ErrorDataResult(null, "User not exits");
    }

    return new SuccessDataResult(temp);
}

async function add(user: UserAdd): Promise<IDataResult<User | null>> {
    const res: Result = await run(
        [
            { function: isUsernameUnique, args: [user.username] },
            { function: isEmailUnique, args: [user.email] }
        ]
    );
    if (!res.status) {
        return new ErrorDataResult(null, res.message);
    }

    user.password = await EncryptionService.hash(user.password)

    const userToAdd: UserAdd = {
        username: user.username,
        email: user.email,
        password: user.password
    }

    const createdUser: User = await UserModel.create(userToAdd);
    return new SuccessDataResult(createdUser, "Created");
}

async function update(id: string, user: UserUpdate, tokenPayload: TokenPayload): Promise<IResult> {
    const res: Result = await run(
        [
            { function: isExists, args: [id] },
            { function: isUserAllowedForOperation, args: [id, tokenPayload] },
            { function: isUsernameUnique, args: [user.username, id] }
        ]
    );
    if (!res.status) {
        return res;
    }

    // If users password changed, re-encrypt it
    if (user.password) {
        const oldUser: User | null = await UserModel.findById(id);
        if (oldUser != null && !await EncryptionService.compare(user.password, oldUser.password)) {
            user.password = await EncryptionService.hash(user.password)
        }
    }

    const userToUpdate: UserUpdate = {
        username: user.username,
        password: user.password
    }

    await UserModel.findOneAndUpdate({ _id: id }, userToUpdate, { new: true });
    return new SuccessResult("User updated");
}

async function changeRole(id: string, role: Roles): Promise<IResult> {
    const res: Result = await run(
        [
            { function: isExists, args: [id] },
            { function: isRolePossible, args: [role] }
        ]
    );
    if (!res.status) {
        return res;
    }

    await UserModel.findOneAndUpdate({ _id: id }, { role: role }, { new: true });
    return new SuccessResult("User deleted");
}

async function suspend(id: string, tokenPayload: TokenPayload): Promise<IResult> {
    const res: Result = await run(
        [
            { function: isExists, args: [id] },
            { function: canChange, args: [id, tokenPayload] }
        ]
    );
    if (!res.status) {
        return res;
    }

    await UserModel.findOneAndUpdate({ _id: id }, { status: Status.SUSPENDED }, { new: true });
    return new SuccessResult("User deleted");
}

async function activate(id: string, tokenPayload: TokenPayload): Promise<IResult> {
    const res: Result = await run(
        [
            { function: isExists, args: [id] },
            { function: canChange, args: [id, tokenPayload] }
        ]
    );
    if (!res.status) {
        return res;
    }

    await UserModel.findOneAndUpdate({ _id: id }, { status: Status.ACTIVE }, { new: true });
    return new SuccessResult("User deleted");
}

async function selfActivate(id: string): Promise<IResult> {
    const res: Result = await run(
        [
            { function: isExists, args: [id] }
        ]
    );
    if (!res.status) {
        return res;
    }

    await UserModel.findOneAndUpdate({ _id: id }, { status: Status.ACTIVE }, { new: true });
    return new SuccessResult("User deleted");
}

async function remove(id: string): Promise<IResult> {
    const res: Result = await run(
        [
            { function: isExists, args: [id] }
        ]
    );
    if (!res.status) {
        return res;
    }

    await UserModel.findOneAndUpdate({ _id: id }, { status: Status.DELETED }, { new: true });
    return new SuccessResult("User deleted");
}

async function purge(id: string, tokenPayload: TokenPayload): Promise<IResult> {
    const res: Result = await run(
        [
            { function: isUserAllowedForOperation, args: [id, tokenPayload] }
        ]
    );
    if (!res.status) {
        return res;
    }

    try {
        await PostModel.deleteMany({ owner: id });
        await PostModel.updateMany({}, { $pull: { comments: { owner: id } } }, { timestamps: false });
        await UserModel.findOneAndDelete({ _id: id });
    }
    catch (error) {
        return new ErrorResult("Operation failed");
    }

    return new SuccessResult("User purged");
}



// ---------- ---------- business rules ---------- ----------

async function isUserAllowedForOperation(operatingUserId: string, tokenPayload: TokenPayload): Promise<IResult> {
    // SYS_ADMIN can do anything
    if (tokenPayload.role == Roles.SYS_ADMIN) {
        return new SuccessResult();
    }

    // Users can delete or update themselves
    if (tokenPayload.id == operatingUserId) {
        return new SuccessResult();
    }

    // Admins can only delete or update users
    if (tokenPayload.role == Roles.ADMIN) {
        const user = await UserModel.findById(operatingUserId);
        if (user.role == Roles.USER) {
            return new SuccessResult();
        }
    }

    return new ErrorResult("Not permitted");
}

async function canChange(operatingUserId: string, tokenPayload: TokenPayload): Promise<IResult> {
    // SYS_ADMIN can do anything
    if (tokenPayload.role == Roles.SYS_ADMIN) {
        return new SuccessResult();
    }

    // Admins can only change regular users
    if (tokenPayload.role == Roles.ADMIN) {
        const user = await UserModel.findById(operatingUserId);
        if (user.role == Roles.USER) {
            return new SuccessResult();
        }
    }

    return new ErrorResult("Not permitted");
}

async function isUsernameUnique(username: string, id?: string): Promise<IResult> {
    let user: any = null;
    if (id == undefined) {
        user = await UserModel.find({ username: username, status: { $ne: Status.DELETED } });
    }
    else {
        user = await UserModel.find({ _id: { $ne: id }, username: username, status: { $ne: Status.DELETED } });
    }

    if (user == null || user.length > 0) {
        return new ErrorResult("username is taken");
    }

    return new SuccessResult();
}

/*
 * Even if user is deleted same Email can not be used.
*/
async function isEmailUnique(email: string): Promise<IResult> {
    const user = await UserModel.find({ email: email });

    if (user.length > 0) {
        return new ErrorResult("email is taken");
    }

    return new SuccessResult();
}

// Unused version also supports update 
// async function isEmailUnique(email: string, id?: string): Promise<IResult> {
//     let user: any = null;
//     if (id == undefined) {
//         user = await UserModel.find({ email: email });
//     }
//     else {
//         user = await UserModel.find({ _id: { $ne: id }, email: email });
//     }

//     if (user == null || user.length > 0) {
//         return new ErrorResult("email is taken");
//     }

//     return new SuccessResult();
// }

async function isExists(id: string): Promise<IResult> {
    const user: any[] = await UserModel.find({ _id: id, status: { $ne: Status.DELETED } });
    if (user.length > 0) {
        return new SuccessResult();
    }
    return new ErrorResult("User not exits");
}

async function isExistsUsername(username: string): Promise<IResult> {
    const user: any[] = await UserModel.find({ username: username, status: { $ne: Status.DELETED } });
    if (user.length > 0) {
        return new SuccessResult();
    }
    return new ErrorResult("User not exits");
}

async function isExistsEmail(email: string): Promise<IResult> {
    const user: any[] = await UserModel.find({ email: email, status: { $ne: Status.DELETED } });
    if (user.length > 0) {
        return new SuccessResult();
    }
    return new ErrorResult("User not exits");
}

async function isRolePossible(role: Roles): Promise<IResult> {
    if (role in Roles || role == null) {
        return new SuccessResult();
    }
    return new ErrorResult("Role is not exists");
}

// ---------- ---------- ---------- ---------- ----------



const UserService = { getAll, getById, getByUsername, getByEmail, add, update, changeRole, suspend, activate, selfActivate, remove, purge };
export default UserService;
