const express  = require("express");
const path = require("path");
const router = express.Router();
const {check, body} = require("express-validator/check");



/** CUSTOM IMPORTS */
const rootDir = require("../utils/path");
const producsController = require("../controllers/products");

router.get('/add-product',producsController.getAddProduct);


router.get('/remove-product/:productId',producsController.getRemoveProduct);

router.post('/buy-products',producsController.postBuyProducts);


// router.get("/orders/:orderId",producsController.getInvoice);


// will accept only incoming POST requests
router.post('/add-product',
[
    body('title'),
    body('description'),
    body('price')
],producsController.postAddProduct);


module.exports = router;

