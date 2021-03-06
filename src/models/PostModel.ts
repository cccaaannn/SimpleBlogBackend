import mongoose, { Schema } from "mongoose";
import Category from "../types/enums/Category";
import Visibility from "../types/enums/Visibility";


const CommentSchema = new Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

const LikeSchema = new Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    {
        timestamps: true
    }
);

const PostSchema = new Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        header: { type: String, required: true },
        body: { type: String, required: true },
        image: { type: String, required: true },
        category: { type: String, default: Category.GENERAL },
        visibility: { type: String, default: Visibility.PUBLIC },
        comments: [CommentSchema],
        likes: [LikeSchema]
    },
    {
        timestamps: true
    }
);

const PostModel = mongoose.model('Post', PostSchema);

export { PostModel };