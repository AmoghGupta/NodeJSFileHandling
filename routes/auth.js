const express  = require("express");
const {check, body} = require("express-validator/check");
const path = require("path");
const router = express.Router();

/** CUSTOM IMPORTS */
const rootDir = require("../utils/path");
const authController = require("../controllers/auth");

/** SIGNUP ROUTE */
router.get('/signup', authController.getSignUp);    
//  adding validators middlewares (check validator) to check the data from POST request
// here we define that what value from POST request we will be testing, "email" in this case
router.post('/signup',
[
check('email')
.isEmail() 
.withMessage("Please enter a valid email")
.normalizeEmail(),
body('password', 'Please enter a valid password')
.isLength({min:5})
.isAlphanumeric()
.trim() 
],


authController.postSignUp);



/**LOGIN ROUTE */
router.get('/login',authController.getLogin);

router.post('/login',authController.postLogin);


router.get('/reset',authController.getReset);

router.post('/reset',authController.postReset);

router.get("/newPassword/:resetToken", authController.getNewPassword);

router.post("/newPassword", authController.postNewPassword);

router.get("/logout", authController.getLogout)



module.exports = router;