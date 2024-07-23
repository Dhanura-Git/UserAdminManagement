const noCacheMid = (req , res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
}

const isLogin = async(req,res,next) => {

    try{

        
        if(!req.session.user_id ){
            return res.redirect('/');
        }else if(req.session.is_admin){
            return res.status(404).send('404 Page Not Found')
        }
    
        next();
        
    }catch(error){
        console.log(error.message);
    }

}

const isLogout = async(req,res,next) => {

    try{

        
        if( req.session.user_id  && !req.session.is_admin){
            
            return res.redirect('/home')

        }else if(req.session.is_admin){
            return res.status(404).send('404 Page Not Found')
        }
        
        next();
        
    }catch(error){
        console.log(error.message);
    }

}

module.exports = {isLogin,isLogout, noCacheMid}