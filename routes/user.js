const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers= require('../helpers/user-helpers')
/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  productHelpers.getAllProducts().then((products)=>{
    // console.log(products)
    res.render('user/view-products',{products,user})
  })
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  } else {
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  console.log(req.body)
  userHelpers.doSignUp(req.body).then((response)=>{
    console.log(response);
    req.session.loggedIn=true
    req.session.user=response.user
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      console.log(req.session.user._id);
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid UserName or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

//middle ware- app.js il specify cheyyunna fn. A fn that has acces to oject in request and response object, 
const verifyLogin =(req,res,next)=>{ //middleware
  if(req.session.loggedIn){
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/cart',verifyLogin,async (req,res)=>{
  console.log(req.session.user._id)
  let products=await userHelpers.getCartProducts(req.session.user._id)
  console.log(products)
  res.render('user/cart',{products,user:req.session.user})//passing kittiya products to cart page
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id)
  res.redirect('/')
})

module.exports = router;
