var db = require('../config/connection')
var collection = require('../config/collection');
const { resolve, reject } = require('promise');
const { ObjectId } = require('mongodb');
const { response } = require('express');
var objectId = require('mongodb').ObjectID
module.exports = {
    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {   //insertOne() is promise fn that's why .then((data))        
            if (data) {
                console.log(data.insertedId);
                callback(data.insertedId);
            }
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            console.log(prodId)
            console.log(objectId(prodId))
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then((response) => {
                resolve(response)
            })
        })   
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                console.log(product)
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},{$set:{
                name: proDetails.name,
                description: proDetails.description,
                price: proDetails.price,
                category: proDetails.category
            }
        }).then((response)=>{
            resolve()
        })
        })
    }
}