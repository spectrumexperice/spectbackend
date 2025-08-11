import mongoose from "mongoose";

const ctaSchema = new mongoose.Schema({
    title:{
        type:String,required:true
    },
    description:{
        type:String
    },
    buttonText:{
        type:String
    },
    buttonLink:{
        type:String
    },
    backgroundColor:{
        type:String,default:"#000"
    },
    textColor:{
        type:String,default:"#fff"
    }
   

},{
    timestamps:true
})
const ctaModel=mongoose.model('Cta',ctaSchema)
export default ctaModel
