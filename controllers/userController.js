const User = require("../models/userModels");
const bcrypt = require('bcrypt')


function emailValidation(email){

    const regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return regExp.test(email)
}


const securePassword = async function(password){

    try{
        
        const hashedP = await bcrypt.hash(password,10)
        return hashedP;

    }catch(error){
        console.log(error.message)
    }
}

const loadRegister = async(req,res) =>{
    
    try {
        
        res.render('registration');
        
        
    } catch (error) {
        

        console.log(error.message);
    }
}

const insertUser = async(req,res)=>{
    
    //Form validation
    const erMessage = {};
     
    if(!req.body.name){
        erMessage.Nm = "This field can't be empty" 
    }else{
        erMessage.CNm = req.body.name
    }
    if(!req.body.email){
        erMessage.Em = "This field can't be empty" 
    }else if(!emailValidation(req.body.email)){
        erMessage.Em = "Invalid email"
    }else{
        erMessage.CEm = req.body.email
    }
    if(!req.body.mobile){
        erMessage.Mob = "This field can't be empty" 
    }else{
        erMessage.CMob = req.body.mobile
    }
    if(!req.body.password){
        erMessage.Ps = "This field can't be empty"
    }
    
    const checkErrKeys = ["Nm","Em","Mob","Ps"];
   
    for(let i = 0 ; i < checkErrKeys.length ; i++){

        if(erMessage.hasOwnProperty(checkErrKeys[i])){
            
            return res.render('registration',erMessage)
            
        }
    }


    const sPassword = await securePassword(req.body.password)
    try{

       const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.file.filename,
            password:sPassword,
            is_admin:0
            
       });
       
       const userData = await user.save();
       if(userData){
            // res.render('registration',{message:"Your registration has been successfully completed."})
            res.render('success',{name:userData.name})
       }else{
            res.render("registration",{message:"Your registration failed. Try again"})
            
       }

    }catch(error){
        console.log(error.message);
    }
}

const loginLoad = async(req,res)=>{
    try{

        if( typeof req.session.is_admin === 'undefined'){
            return res.render('login')    
        }else{
            
            return res.status(404).send('404 Page Not Found')
        }
       

    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res) =>{
    

    try{

        const email = req.body.email
        const password = req.body.password

        //Form validation
        const erMessage = {};
       
        if(!email){
            erMessage.Em = "This field can't be empty" 
        }else if(!emailValidation(email)){
            erMessage.Em = "Invalid email"
        }
        if(!password){
            erMessage.Ps = "This field can't be empty"
        }
        if(Object.keys(erMessage).length > 0){
            return res.render('login',erMessage)
        }

        const userData = await User.findOne({email:email})
        
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch && !userData.is_admin){

                //4th vid 15min Add if needed(Email Varification)
                req.session.user_id = userData._id;
                req.session.is_admin = userData.is_admin;

                    res.redirect('/home')

            }else{
                res.render('login',{message:"Invalid email or password"})
            }
        }else{
            res.render('login',{message:"Invalid email or password"})
        }

    }catch(error){
        console.log(error.message+"VerifyLogin Error !!!")
    }

}

const loadHome = async(req,res) => {
    try{
        const userData = await User.findById({_id:req.session.user_id})

        if(req.session.user_id && !req.session.is_admin){

            res.render('home',{user:userData})
        }else{
            res.status(404).send('404 Page Not Found')
        }
    }catch(error){
        console.log(error.message)
    }
}

const userLogout = async(req, res) => {

        try{
            req.session.destroy();
            res.redirect('/');
        }catch(error){
            console.log(error.message);
        }

}

//User editing page
const editLoad = async(req,res) => {
    try{

        const id = req.query.id;
        const userData = await User.findById({_id:id})
        if(userData && req.session.user_id ){
            res.render('edit-user',{user:userData});
        }else{
            res.redirect('/home');
        }

    }catch(error){
        console.log(error.message);
    }
}

const uploadProfile = async(req,res) => {

    
    try{
        
        sPassword = await securePassword(req.password);
    
        if(req.file){

            await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,password:sPassword,image:req.file.filename}})

        }else{
            await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,password:sPassword}})
        }

        
        res.redirect('/home');

    }catch(error){
        console.log(error.message)
    }

}

module.exports = {
        loadRegister,
        insertUser,
        loginLoad,
        verifyLogin,
        loadHome,
        userLogout,
        editLoad,
        uploadProfile
}