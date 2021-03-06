// Project imports
import { IResult } from "../core/results/Result";
import UserService from "../services/user.service"

async function getAll(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.getAll(
            { 
                page: req.query.page, 
                limit: req.query.limit, 
                sort: req.query.sort, 
                asc: req.query.asc
            });

        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

async function getById(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.getById(req.params.id);
        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

async function update(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.update(req.params.id, req.body, res.locals.tokenPayload);
        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

async function changeRole(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.changeRole(req.params.id, req.params.role);
        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

async function suspend(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.suspend(req.params.id, res.locals.tokenPayload);
        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

async function activate(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.activate(req.params.id, res.locals.tokenPayload);
        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

async function remove(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.remove(req.params.id);
        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

async function purge(req: any, res: any, next: any) {
    try {
        const result: IResult = await UserService.purge(req.params.id, res.locals.tokenPayload);
        if(result.status) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } 
    catch (err: any) {
        res.locals.err = err;
        next();
    }
}

const UserController = { getAll, getById, update, changeRole, suspend, activate, remove, purge };
export default UserController;
