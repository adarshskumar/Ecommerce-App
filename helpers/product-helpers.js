var db=require('../config/connection')
var collection = require('../config/collection');
const { resolve, reject } = require('promise');

module.exports={
    addProduct:(product,callback)=>{
        console.log("line");
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
             
             if(data){
                console.log( data.insertedId);
                callback(data.insertedId);
             }
            
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
}