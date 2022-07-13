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
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId)},
                    {
                        $push: { products: objectId(proId) }
                    }
                ).then((response) => {
                    resolve()
                })
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [objectId(proId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                }, 
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { prodList: '$products' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', '$$prodList'
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'cartItems'  
                        },
                    }
            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({use:objectId(userId)})
            if(cart){
                count = cart.products.length
            }
        })
    }
}