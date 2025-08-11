import {v2 as cloudinary} from 'cloudinary'
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLODINARY_API_KEY, 
        api_secret: process.env.CLODINARY_API_SECRET_KEY
    });
const uploadImageCloudinary=async(image)=>{
   const buffer=image?.buffer || Buffer.from(await image.arrayBuffer())
   const uploadImage=await new Promise((res,reject)=>{
    cloudinary.uploader.upload_stream({folder:"Spectrum"},(error,uploadRes)=>{
       if (error) return reject(error);
      return res(uploadRes)  
    }).end(buffer)
   })
   return uploadImage
}
export default uploadImageCloudinary