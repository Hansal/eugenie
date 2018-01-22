// const config = require('/etc/eugenie/config');
const config = require('config');
var express = require('express');
var router = express.Router();

// const setIsAdmin = (boolValue) => {
//     global.isAdmin = boolValue;
//     console.log("Set adminFlag ", global.isAdmin);
// }

router.get('/', (req, res) => {

    if(req.session.adminLoggedInSucess == config.session.adminKey){
        res.render('admin', {message: 'Already logged in as admin'});
    } else {
        res.render('admin', {message: 'Log in as admin OR '});
    }

});

router.get('/logout', (req, res) => {
    if(req.session.adminLoggedInSucess == config.session.adminKey){
        req.session.adminLoggedInSucess = null;
        req.session.isAdmin = false;
        res.render('admin', {message: 'Logged out. '});
    } else {
        res.render('admin', {message: 'Already logged out as admin'});
    }

});
'randompass'
router.post('/', (req, res) => {
    if(req.body.password && req.body.password != config.admin.password){
        req.session.isAdmin = false;
        req.session.adminLoggedInSucess = null;
        res.render('admin', {message: 'Incorrect password, Try again OR '});
    } else {
        req.session.isAdmin = true;
        req.session.adminLoggedInSucess = config.session.adminKey;
        res.render('admin', {message: 'Logged in as Admin. You can now '});
    }

});



module.exports = router;
