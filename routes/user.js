const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers= require('../helpers/user-helpers')
/* GET home page. */
router.get('/',async function(req, res, next) { //error-async
  let user=req.session.user
  let cartCount = 0
  if(req.session.user) {
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  // console.log(cartCount)
  productHelpers.getAllProducts().then((products)=>{
    // console.log(products)
    res.render('user/view-products',{products,user,cartCount})
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

router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
  userHelpers.addToCart(req.params.id,req.session.user._id)
  res.json({status:true})
  // res.redirect('/')
})

router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    res.json(response)
  })
})


module.exports = router;
