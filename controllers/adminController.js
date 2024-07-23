const User = require("../models/userModels");
const bcrypt = require('bcrypt')

function emailValidation(email){

    const regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return regExp.test(email)
}


const securePassword = async(password) => {

    try{

        const hashedP = await bcrypt.hash(password,10)
        return hashedP;

    }catch(error){
        console.log(error.message)
    }
}

const  loadLogin = async(req,res) => {
    
    try{


        if( typeof req.session.is_admin === 'undefined'){
            
            return res.render('login')    
        }else{
            
            return res.status(404).send('404 Page Not Found')
        }

    }catch(error){
        console.log(error.message,"LoadLoginAdmin Error !!!");
    }
}

const verifyLogin = async (req,res) => {

    try{

        const email = req.body.email;
        const password = req.body.password;
        
          //Form validation
          const erMessage = {};
       
          if(!email){
              erMessage.Em = "This field can't be empty" 
          }else if(!emailValidation(email)){
              erMessage.Em = "Invalid email"
          }else{
            erMessage.CEm = email;
          }
          if(!password){
              erMessage.Ps = "This field can't be empty"
          }

          const checkErrKeys = ["Em","Ps"];
          for(let i = 0 ; i < checkErrKeys.length ; i++){
      
              if(erMessage.hasOwnProperty(checkErrKeys[i])){        
                  
                  return res.render('login',erMessage)
                  
              }
          }
    

        const userData = await User.findOne({email:email});

        
        if(userData){

            if(userData.is_admin === 0){
                return res.render('login',{message:"email and password wrong."})    
            }

            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){

               
                    req.session.user_id = userData._id;
                    req.session.is_admin = true;
                    res.redirect('/admin/home')
              
              

            }else{
                res.render('login',{message:"Wrong password wrong."})
            }

        }else{
            res.render('login',{message:"email and password wrong."})
        }

    }catch(error){
        console.log(error.message);
    }
}

const loadDashboard = async (req,res) => {

    try{
        const userData = await User.findById({_id:req.session.user_id})
        res.render('home',{admin:userData})
    }catch(error){
        console.log(error.message);
    }
}


const logout = async(req,res) => {

    try{

        req.session.destroy();
        res.redirect('/admin')

    }catch(error){

        console.log(error.message);
    }
}

// const adminDashboard = async(req,res) => {
    
//     try{

//         if(req.session.user_id && req.session.is_admin){

//             const userData = await User.find({is_admin:0})

//             if(!req.query.name){
                
//                return res.render('dashboard',{users : userData})
//             }else{
                
//                 const isAvailable = userData.some(person => person.name == req.query.name )
//                 console.log(isAvailable)
//                 // if(isAvailable){


//                 //     return res.render('dashboard',{users : userData})
//                 // }
                            
//             }

//         }else{
//             res.redirect('login')
//         }
        
//     }catch(error){
        
//         console.log(error.message,"adminDashboard Error !!!");
//     }
// }
const adminDashboard = async(req,res) => {
    
    try{
       
        if(req.session.user_id && req.session.is_admin){

            let userData = await User.find({is_admin:0})

            if(!req.query.name){
                
               return res.render('dashboard',{users : userData})
            }else{
                
                // let isAvailable = userData.some(person => person.name == req.query.name )
                userData = await User.find({$or:[{name: req.query.name},{email:req.query.name}]})
                return res.render('dashboard',{users : userData})
                
                            
            }

        }else{
            res.redirect('login')
        }
        
    }catch(error){
        
        console.log(error.message,"adminDashboard Error !!!");
    }
}
// const   searchUser = async (req,res) => {

//     try{

        
//         const userData = await User.find({name:req.query.name}) 
            
//         if(req.session.user_id && req.session.is_admin){

//             const userData = await User.find({is_admin:0})
//             return res.render('dashboard',{users : userData})
//         }else{
//             res.redirect('login')
//         }

//     }catch(error){
//         console.log(error.message)
//     }
// }

const newUserLoad = async(req,res) => {
    
        try{

            if(req.session.user_id){
                res.render('newUser')
            }

        }catch(error){
            console.log(error.message)
        }

}


const addUser = async(req,res) => {

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
             
             return res.render('newUser',erMessage)
             
         }
     }

    const sPassword = await securePassword(req.body.password)

    try{

        const user = new User({
            name : req.body.name,
            email : req.body.email,
            mobile : req.body.mobile,
            image : req.file.filename,
            password : sPassword,
            is_admin : 0
            
        })

        const userData = await user.save()        
        if(userData){
            res.render('success',{message:"Successfully added user."})
            
        }else{
            res.render('newUser',{message:"Could not add new user"})
        }

    }catch(error){

    }
}


//User editing
const editUserload = async(req,res) => {

    try{

        const id = req.query.id;
        const userData = await User.findById({_id:id});

        if(userData){
            res.render('editUser', {user:userData})
        }else{
            res.redirect('/admin/dashboard')
        }

    }catch(error){

        console.log(error.message)
    }
}

const updateUsers = async(req,res) => {

    try{
        const sPassword = await securePassword(req.body.password)
       await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name, email:req.body.email,password: sPassword}})
     
       res.redirect('/admin/dashboard')

    }catch(error){
        console.log(error.message)
    }
}


const deleteUser = async(req,res) => {

    const id = req.query.id;
    try{
       
        await User.deleteOne({_id:id});
        res.redirect('/admin/dashboard')

    }catch(error){
        console.log(error.message)
    }

}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    // searchUser,
    newUserLoad,
    addUser,
    editUserload,
    updateUsers,
    deleteUser 
}