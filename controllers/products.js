const Product = require("../models/product");
const Orders = require("../models/order");
const {validationResult} = require("express-validator/check");
const fs = require('fs');
const path = require("path");
const rootDir = require("../utils/path");
const uuidv1 = require('uuid/v1');
const PDFKit = require("pdfkit");

// function to check Authentication
function isAuthenitcatedUsingSession(req,res){
    return new Promise((resolve, reject)=>{
        if(req.session.isLoggedIn){
            resolve("Authenicated");
        }else{
            reject("Not Authorized")
        }
    });
}


// function isAuthenitcatedUsingCookies(req,res){
//     return new Promise((resolve, reject)=>{
//         if(req.cookies['loggedIn']){
//             resolve("Authenicated");
//         }else{
//             reject("Not Authorized")
//         }
//     });
// }

getAddProduct = (req, res, next)=>{
    isAuthenitcatedUsingSession(req,res).then((data)=>{
        res.render('addProduct',
        {
            pageTitle: 'Add Product Page',
            addProductPage: true,
            errorMessage: req.flash('addProductError'),
            userName: req.session.user
        }
        );
    }).catch((err)=>{
        res.status(401).redirect('/login');
    });
    
}


getRemoveProduct = (req, res, next)=>{
    isAuthenitcatedUsingSession(req,res).then((data)=>{
        //reading from URL params
        const productId = req.params.productId;
        const emailId = req.session.user;
        if(productId && emailId){
            Product.removeById(productId,emailId).then((data)=>{
                console.log('removed product');
                req.flash("getProductError", "Item Removed");
                res.redirect("/");
            }).catch((err)=>{
                console.log(err);
            });
        }
   }).catch((err)=>{
    res.status(401).redirect('/');
   });
}


getPreviousOrders = (req, res, next)=>{
    isAuthenitcatedUsingSession(req,res).then((data)=>{
        Orders.fetchAllOrdersByEmailId(req.session.user).then((ordersData)=>{
            console.log("Fetched all orders of the current user");
            res.render('orderHistory',
            {
                orders:ordersData,
                pageTitle: 'Order Placed',
                shopPage: true,
                userName: req.session.user,
                pageMessage: "below are your previous orders",
            });
        }).catch((err)=>{
            console.log("Error fetching all older orders "+err);
        });
    }).catch((err)=>{
        console.log("Not authenticated "+err);
    });
}

postBuyProducts = (req, res, next)=>{
    isAuthenitcatedUsingSession(req,res).then((data)=>{
        Product.fetchAll(req.session.user).then((products)=>{
            console.log("Fetched products added in cart");
            if(!products.length){
                return res.status(401).redirect('/');
            }
            let orderData = [];
            products.forEach(function(product){  
                orderData.push({
                    title: product['title'],
                    price: product['price'],
                    image: product['image']
                });
            });
            
            const newOrderId = uuidv1()+'_'+Date.now();
            const order = new Orders(orderData, req.session.user,newOrderId);
            order.save().then((data)=>{
                console.log("Newly created order saved in collections");
                Orders.fetchAllOrders(req.session.user, newOrderId).then((ordersData)=>{
                    console.log("Fetched latest order data of the user");
                    console.log(ordersData);
                    Product.removeProductsByEmailId(req.session.user).then((data)=>{
                        console.log("Products added in cart cleared");
                        console.log("Renedering the orders confirmation page");

                        res.render('confirmationBuyPage',
                        {
                            products:ordersData[0].orderInfo,
                            orderId: ordersData[0].orderId,
                            pageTitle: 'Order Placed',
                            shopPage: true,
                            userName: req.session.user,
                            pageMessage: "your order with following items is placed.",
                        });
    
                    }).catch((err)=>{
                        console.log(err);
                        console.log("Error while deleting products in cart "+ err);
                    });

                }).catch();

                
            }).catch((err)=>{
                console.log(err);
                console.log("Facing issues while trying to save new order "+ err);
            });
        }).catch((err)=>{
            console.log("Unable to fetch products in the cart"+ err);
            res.status(500).send(err);
        })
    }).catch((err)=>{
        console.log("User is not authenticated");
        res.status(401).redirect('/login');
    });
}

postAddProduct = (req, res, next)=>{
     // here we actually validate the data in the request 
     const errors = validationResult(req);
     if(!errors.isEmpty()){
         console.log(errors.array());
         req.flash("addProductError", errors.array()[0].msg);
         return res.status(422).redirect("/admin/add-product");
     }

    isAuthenitcatedUsingSession(req,res).then((data)=>{
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price.toString();
        const userEmail = req.session.user;
        const uploadedImage = req.file;
        if(!uploadedImage){
            //req.flash("addProductError", "Invalid file type uploaded try again");
            return res.status(422).render('addProduct',
            {
                pageTitle: 'Add Product Page',
                addProductPage: true,
                errorMessage:"Invalid file type uploaded try again"
            })
        }
        const image = uploadedImage.path;
        const productData = {
            title,
            description,
            price,
            userEmail,
            image
        }
        const product = new Product(productData);
        product.save().then((data)=>{
            console.log('saved')
            res.redirect("/");
        }).catch((err)=>{
            console.log(err);
        });
    }).catch((err)=>{
        res.status(401).redirect('/login');
    });

    
}

getProducts = (req, res, next)=>{
    isAuthenitcatedUsingSession(req,res).then((data)=>{
        Product.fetchAll(req.session.user).then((products)=>{
            res.render('shop',
            {
                products:products,
                pageTitle: 'Shop Page',
                shopPage: true,
                userName: req.session.user,
                errorMessage: req.flash('getProductError'),
                pageMessage: products.length?"You have added the following products:":"No Items Added",
                hasItems: products.length?true:false
            }
            );
            
        }).catch(()=>{
            res.status(500).send("Something went wrong file fetching data from database");
        })
    }).catch((err)=>{
        res.status(401).redirect('/login');
    });

    
}


getProductDetails = (req, res, next)=>{
    isAuthenitcatedUsingSession(req,res).then((data)=>{
         //reading from URL params
        const prodId = req.params.productId;
        Product.findById(prodId).then((product)=>{
            res.render('product-details',
            {
                product:product,
                pageTitle: 'Product Details Page',
                detailsPage: true,
                userName: req.session.user
            }
        );
        }).catch((err)=>{
            console.log("ERROR FETCHING DATA: ",err);
        })
    }).catch((err)=>{
        res.status(401).redirect('/login');
    });

   
}


const getInvoice =(req,res,next)=>{
    isAuthenitcatedUsingSession(req,res).then((data)=>{
        //reading from URL params
       const orderId = req.params.orderId;

       Orders.fetchAllOrders(req.session.user,orderId).then((data)=>{
        const invoiceName = "invoice-"+orderId+".pdf";
        //const invoicePath = path.join(rootDir+"/invoices", invoiceName);
        
        const pdfDoc = new PDFKit();
        res.setHeader('Content-Type','application/pdf');
        //sets whether the file should download or open
        res.setHeader('Content-Disposition','attachment; filename="'+invoiceName+'"');
        // pdfDoc is a readable stream
        // readable streams can be piped to writable stream or vice versa
        //pdfDoc.pipe(fs.createWriteStream(invoicePath));
        // readstream starts writing to response stream
        pdfDoc.pipe(res);
        
        let itemString='\n';
        data[0].orderInfo.forEach((item,index)=>{
            itemString = itemString+((index+1)+': '+item.title+' of worth '+ item.price+'\n')
        });

        let messageString = `Your order id is ${data[0].orderId} and you ordered: \n ${itemString}`;

        pdfDoc.text(messageString);
        //closes the stream
        pdfDoc.end();
       }).catch((err)=>{
        console.log("Error fetching order data: "+err);
       });
       
    
    /** Reading Synchronously, here node has to preload all data into memory */
    /** suitable for small files */
    //    fs.readFile(invoicePath, (err, data)=>{
    //     if(err){
    //         return next(err);
    //     }
    //     //tells the browser the file type
    //     res.setHeader('Content-Type','application/pdf');
    //     //sets whether the file should download or open
    //     res.setHeader('Content-Disposition','attachment; filename="'+invoiceName+'"');
    //     res.send(data);
    //    });

    /** Reading ASynchronously for large files*/
    //const file = fs.createReadStream(invoicePath);
    // res.setHeader('Content-Type','application/pdf');
    // //sets whether the file should download or open
    // res.setHeader('Content-Disposition','attachment; filename="'+invoiceName+'"');
    // //pipe the data in stream to response
    // //res is a writable stream
    // file.pipe(res);

   }).catch((err)=>{
    res.status(401).redirect('/login');
   });
}

exports.getProducts =getProducts;
exports.getAddProduct = getAddProduct;
exports.postAddProduct = postAddProduct;
exports.getProductDetails =getProductDetails;
exports.getInvoice = getInvoice;
exports.isAuthenitcatedUsingSession = isAuthenitcatedUsingSession;
exports.getRemoveProduct = getRemoveProduct;
exports.postBuyProducts = postBuyProducts;
exports.getPreviousOrders = getPreviousOrders;
