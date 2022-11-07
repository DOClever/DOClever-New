import article=require("../model/articleModel")
import {ArticleModel} from "../model/types";
import {InstanceType} from "typegoose";

class ArticleDao{
    async save (id,query){
        let obj:InstanceType<ArticleModel>;
        if (id) {
            obj = await article.findOneAndUpdate({
                _id: id
            }, query, {
                new: true
            })
        }
        else {
            obj = await article.create(query)
        }
        return obj;
    }
    async remove (id){
        await article.remove({
            _id: id
        });
    }
    async info (id){
        let obj=await article.findOne({
            _id: id
        }, null, {
            populate: {
                path: "creator",
                select: "name photo"
            }
        });
        return obj;
    }
    async list (projectId,page){
        let arr=await article.find({
            project: projectId
        }, "-content", {
            populate: {
                path: "creator",
                select: "name photo"
            },
            sort: "-updatedAt",
            skip: 10 * page,
            limit: 10
        });
        return arr;
    }
}

export=new ArticleDao;







