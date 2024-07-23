const express = require('express')
const adminRoute = express();

const session = require('express-session')
const config = require('../config/config.js')
adminRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

adminRoute.use(express.urlencoded({extended:true}));

adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

const path = require('path')

const multer = require('multer')
const storage = multer.diskStorage({

    destination: function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'))
    },
    filename: function(req,file,cb){
        const name = Date.now()+'_'+file.originalname;
        cb(null,name)
    }
})

const upload = multer({storage:storage})


const adminAuth = require('../middleware/adminAuth.js')
const adminController = require('../controllers/adminController.js')

adminRoute.use(adminAuth.noCacheMid)

adminRoute.get('/',adminAuth.isLogout,adminController.loadLogin)
adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/home',adminAuth.isLogin ,adminController.loadDashboard)

adminRoute.get('/logout',adminAuth.isLogin ,adminController.logout)

adminRoute.get('/dashboard',adminAuth.isLogin, adminController.adminDashboard)
// adminRoute.get('/dashboard/data', adminController.searchUser)

adminRoute.get('/newUser',adminAuth.isLogin,adminController.newUserLoad)
adminRoute.post('/newUser',upload.single('image'),adminController.addUser)
//Add this and also add multer 

adminRoute.get('/editUser',adminAuth.isLogin,adminController.editUserload)
adminRoute.post('/editUser',adminController.updateUsers)

adminRoute.get('/deleteUser',adminController.deleteUser)

adminRoute.get('*', (req,res) => {
        
    res.redirect('/admin')
})

module.exports = adminRoute