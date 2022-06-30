var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {

//dummy
  // let products=[
  //   {
  //     name:"Iphone 13",
  //     category: "Mobile",
  //     description: "This is a good phone",
  //     image:"data:image/jpeg;base64,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"
  //   },
  //   {
  //     name:"Iphone 13 pro max",
  //     category: "Mobile",
  //     description: "This is a good phone",
  //     image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXuMKCSdNhPSGdtBHuszfVYskfrxEhvNoaqQ&usqp=CAU"
  //   },
  //   {
  //     name:"Iphone 11",
  //     category: "Mobile",
  //     description: "This is a good phone",
  //     image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj7Jhu5QPUHexHn_Ph9DyTeSB2FdlHDPkLQw&usqp=CAU"
  //   },
  //   {
  //     name:"Oneplus Nord CE 2 5G",
  //     category: "Mobile",
  //     description: "This is a good phone",
  //     image:"data:image/jpeg;base64,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"
  //   },
  // ]

  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-product',{admin:true,products})
  })
  
});
router.get('/add-product',function(req,res){ //retreiving the form
  res.render('admin/add-product')
});

router.post('/add-product',(req,res)=>{ //form posting
  // console.log(req.body); 
  // console.log(req.files.img);

  productHelpers.addProduct(req.body,(id)=>{ //here req.body contains the data we added in add product page 
    //call back fn (id)=> {}
    let image=req.files.img
    console.log(id);
    image.mv('./public/product-images/'+id+'.jpg',(err)=>{
      if(!err){
        res.render("admin/add-product")
      }
      else {
        console.log(err);
      }

    })

  })

})

module.exports = router;
