var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const { CART_COLLECTION } = require('../config/collection')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const { use } = require('../routes/user')
var objectId = require('mongodb').ObjectID


module.exports = {
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.pass = await bcrypt.hash(userData.pass, 10)
            // console.log(userData.pass) -> returns hashed password
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId) // it returns the id
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.pass, user.pass).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed'),
                    resolve({ staus: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({user:objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 } //since products is an array and we are changing an element of an array therefore we using .$. here
                            }).then(() => {
                                resolve()
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj],
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) } //matched with this users object id
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: { //projecting list of products to an object
                        item: 1, //items venam -->bool 1
                        quantity: 1,
                        product: { $arrayElemAt: ["$product", 0] }
                    }
                }
                // {
                //     $lookup: { //fetching details of that id from product collections
                //         from: collection.PRODUCT_COLLECTION,
                //         let: { prodList: '$products' },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $in: ['$_id', '$$prodList'
                //                         ]
                //                     }
                //                 }
                //             }
                //         ],
                //         as: 'cartItems'
                //     },
                // }
            ]).toArray()
            // console.log(cartItems[0].products)
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: ((details) => {
        details.count = parseInt(details.count)
        details.quantity=parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}} //products matching is already done here. that's why we are not passing products
                }).then((response)=>{
                    resolve({removeProduct:true})
                })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count } //since products is an array and we are changing an element of an array therefore we using .$. here
                    }).then((response) => {
                        resolve(true)
                    })
            }
        })
    })
}