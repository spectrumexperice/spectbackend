import { Router } from 'express'
import auth from '../middleware/auth.js'
import isAdmin from '../middleware/admin.js'
import upload from '../middleware/multer.js'
import {getCategories, addProduct,getAllProducts,getProductBySlug,updateProduct,deleteProduct,searchProducts, 
  getProductsGrouped, addCategory, 
  getSubcategories,
  getSubcategoryProducts} from '../controller/productController.js'
const productRouter=Router()

productRouter.get('/all',getAllProducts)
productRouter.post(
  '/add',
  auth,
  isAdmin,
  upload.fields([
    { name: 'images', maxCount: 10 },       // الصور
    { name: 'attachments', maxCount: 10 }   // الملفات المرفقة
  ]),
  addProduct
);

productRouter.get('/getone/:slug',getProductBySlug)
productRouter.get('/search',searchProducts)
productRouter.patch(
  '/update/:id', 
  auth, 
  isAdmin, 
 upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'attachments', maxCount: 10 }
]),

  updateProduct
)


productRouter.delete('/delete/:id',auth,isAdmin,deleteProduct)
productRouter.get('/category',getCategories)
productRouter.post('/addCategory',addCategory)
productRouter.get('/subcategory',getSubcategories) 
productRouter.get('/getsubcategoryProduct/:sub',getSubcategoryProducts)
productRouter.get('/getGroup',getProductsGrouped)

export default productRouter