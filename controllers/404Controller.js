
const isAuthenticated = require("../controllers/products").isAuthenitcatedUsingSession;
const notFound404 = (req, res, next)=>{
    isAuthenticated(req,res).then((data)=>{
        res.status(404).render('404', {pageTitle: 'Page not found'});
     }).catch((err)=>{
        res.redirect('/login');
     });
    
}


exports.notFound404 = notFound404;