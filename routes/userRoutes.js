
const express =  require('express')
const userRoute = express();

const session = require('express-session')
const config = require('../config/config.js')
userRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

const auth = require('../middleware/auth.js')
userRoute.use(['/', '/login', '/register', '/home', '/logout'],auth.noCacheMid);

userRoute.use(express.urlencoded({extended:true}));

userRoute.set('view engine','ejs')
userRoute.set('views','./views/Users')

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

const userController = require('../controllers/userController.js')

userRoute.get('/register',auth.isLogout,userController.loadRegister)  
userRoute.post('/register',upload.single('image'),userController.insertUser)

userRoute.get('/',auth.isLogout,userController.loginLoad)
userRoute.get('/login',auth.isLogout,userController.loginLoad)
userRoute.post('/login',userController.verifyLogin)

userRoute.get('/home',auth.isLogin,userController.loadHome)

userRoute.get('/logout', auth.isLogin,userController.userLogout)

userRoute.get('/edit-user',auth.isLogin,userController.editLoad)
userRoute.post('/edit-user', upload.single('image'),userController.uploadProfile)
  
module.exports = userRoute