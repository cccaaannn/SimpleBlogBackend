import { PostService } from "../services/post.service"
import { PostSort } from "../types/Post";

async function getAll(req: any, res: any, next: any) {
    try {
        let postSort: PostSort|undefined = undefined;
        if(req.query.field && req.query.asc) {
            postSort = { [req.query.field]: req.query.asc };
        }

        res.json(await PostService.getAll(postSort));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}

async function getByVisibility(req: any, res: any, next: any) {
    try {
        let postSort: PostSort|undefined = undefined;
        if(req.query.field && req.query.asc) {
            postSort = { [req.query.field]: req.query.asc };
        }

        res.json(await PostService.getByVisibility(req.params.visibility, postSort));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}

async function getByUserId(req: any, res: any, next: any) {
    try {
        let postSort: PostSort|undefined = undefined;
        if(req.query.field && req.query.asc) {
            postSort = { [req.query.field]: req.query.asc };
        }

        res.json(await PostService.getByUserId(req.params.userId, postSort));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}

async function add(req: any, res: any, next: any) {
    try {
        res.json(await PostService.add(req.body));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}

async function update(req: any, res: any, next: any) {
    try {
        res.json(await PostService.update(req.params.id, req.body));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}

async function addComment(req: any, res: any, next: any) {
    try {
        res.json(await PostService.addComment(req.params.id, req.body));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}

async function removeComment(req: any, res: any, next: any) {
    try {
        res.json(await PostService.removeComment(req.params.postId, req.params.commentId));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}

async function remove(req: any, res: any, next: any) {
    try {
        res.json(await PostService.remove(req.params.id));
    } catch (err: any) {
        console.error(`Error`, err.message);
        next(err);
    }
}



export const PostController = {
    getAll,
    getByVisibility,
    getByUserId,
    add,
    update,
    addComment,
    removeComment,
    remove
};