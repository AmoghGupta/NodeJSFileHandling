const mongoDB = require("../utils/database"); 
const ObjectId = require('mongodb').ObjectId; 
const rootPath = require('../utils/path');


class Orders {
    constructor(data, email, orderId){
        this.orderInfo = data;
        this.userEmail = email;
        this.orderId = orderId
    }

    save(){        
         /** CONNECT TO DB */
         const db = mongoDB.getDb();
         return db.collection('orders').insertOne(this);
    }

    static fetchAllOrders(emailId, newOrderId){
        /** CONNECT TO DB */
        const db = mongoDB.getDb();
        return db.collection('orders').find(
        {
            "userEmail":emailId,
            "orderId":newOrderId
        }).toArray();
    }

    static fetchAllOrdersByEmailId(emailId){
        /** CONNECT TO DB */
        const db = mongoDB.getDb();
        return db.collection('orders').find(
        {
            "userEmail":emailId
        }).toArray();
    }
}


module.exports = Orders;