const mongoDB = require("../utils/database"); 
const ObjectId = require('mongodb').ObjectId; 
const rootPath = require('../utils/path');

class Product {
    constructor(data){
        this.title = data.title;
        this.description = data.description;
        this.price = data.price.toString();
        this.userEmail = data.userEmail;
        this.image = data.image;
    }

    save(){        
         /** CONNECT TO DB */
         const db = mongoDB.getDb();
         return db.collection('products').insertOne(this);
    }

    static fetchAll(emailId){
        /** CONNECT TO DB */
        const db = mongoDB.getDb();
        return db.collection('products').find({"userEmail":emailId}).toArray();
    }

    static findById(productId,){
        /** CONNECT TO DB */
        const db = mongoDB.getDb();
        var o_id = new ObjectId(productId);
        return db.collection('products').findOne({"_id":o_id})
    }

    static removeById(productId,emailId){
        /** CONNECT TO DB */
        const db = mongoDB.getDb();
        let o_id = new ObjectId(productId);
        return db.collection('products').remove(
            { 
                'userEmail': emailId,
                '_id':o_id
            },
            {
                justOne: true
            }
         );
    }

    static removeProductsByEmailId(emailId){
        /** CONNECT TO DB */
        const db = mongoDB.getDb();
        return db.collection('products').remove(
            { 
                'userEmail': emailId
            },
         );
    }
}


module.exports = Product;