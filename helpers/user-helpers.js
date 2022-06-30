var db=require('../config/connection')
var collection = require('../config/collection')
const bcrypt= require('bcrypt')
const { resolve, reject } = require('promise')

module.exports={
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.pass=await bcrypt.hash(userData.pass,10)
            // console.log(userData.pass) -> returns hashed password
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId) // it returns the id
            })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.pass, user.pass).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.user=user
                        response.status=true
                        resolve(response)
                    } else {
                        console.log("login failed")
                        resolve({status:false})
                    }
                })
            } else {
                console.log('login failed'),
                resolve({staus:false})
            }
        })
    }
}