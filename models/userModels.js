const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    mobile:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    image:{
        type:String,
        required:true
    },

    is_admin:{
        type:Number,
        required:true
    },

    is_verified:{
        type:Number,
        default:0
    }

});


module.exports = mongoose.model('User', userSchema) 
//mongoose.model() is a method provided by mongoose it allows us to create a model based on a scheme
//Here the first argument "User" is the model name and 2nd argumen "userSchema" is the schema object
//defining the structure of documents for this model.