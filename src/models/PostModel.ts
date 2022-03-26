import mongoose, { Schema } from "mongoose";
import Visibility from "../types/enums/Visibility";


const CommentSchema = new Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now }
});

const PostSchema = new Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    header: { type: String, required: true },
    body: { type: String, required: true },
    visibility: { type: String, default: Visibility.PUBLIC },
    comments: [CommentSchema],
    dateCreated: { type: Date, default: Date.now },
});

const PostModel = mongoose.model('Post', PostSchema);

export { PostModel };