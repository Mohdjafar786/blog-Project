const mongoose = require('mongoose');
const authorModel = require("../Models/authorModel")
const blogModel = require("../Models/blogModel")

const isValid = (value) =>{
    if(typeof value === 'undefined' || value === "null") return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true ;
}

const isValidRequestBody = (requestBody) => {
    return Object.keys(requestBody).length > 0
} 

const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
const createblog = async function (req, res) {
    try {
        let data = req.body

        const { title, body, authorId, tags, category, subcategory } = data
        if (Object.keys(data) == 0) { 
            return res.status(400).send("data is missing") 
        }
        const req0 = isValid(title)
        if (!req0) {
            return res.status(400).send("title is required")
        }
        const req1 = isValid(body)
        if (!req1) {
             return res.status(400).send("body is required")
        }
     

        const req3 = isValid(tags)
        if (!req3)
         return res.status(400).send("tags is required")

        const req4 = isValid(category)
        if (!req4)
         return res.status(400).send("category is required")

        const req5 = isValid(subcategory)
        if (!req5) 
        return res.status(400).send("subCategory is required")


        let isPublished = req.body.isPublished

        if (isPublished === true) {
            data["publishedAt"] = new Date()
        }
      

        const idData = await authorModel.findById(authorId)
        if (!idData) {
            res.status(404).send({ status: false, message: "Author does not exist" })
        }
        const savedData = await blogModel.create(data)
        res.status(201).send({ status: true, message: 'New blog created successfully', result : savedData })

    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status : false ,message : err.message })
    }
}




const getblog= async function (req, res) {

    try {

        let queryParams = req.query
    const keys=Object.keys(queryParams)
  
        const requiredQueryParams = ['authorId', 'category','tags','subcategory'];
        for (let i = 0; i < keys.length; i++) {
            if (!requiredQueryParams.includes(keys[i])) {
                return res.status(400).send({
                    status: false,
                    message: `Only these body params are allowed ${requiredQueryParams.join(", ")}`
                });
            }
        }
    
        const filterQuery = { isDeleted : false , deletedAt : null , isPublished : true }
      
        
        if(isValidRequestBody(queryParams)) {
          const {authorId , category , tags, subcategory} = queryParams 

          if(authorId){
            if(!isValidObjectId(authorId)){
                return res.status(400).send({status:false, message:"Only mongoDb Id is allowed"})
            }
        }
        if (isValid(authorId)) {
            filterQuery["authorId"] = authorId.trim()
        }
        

            if(isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if(isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] ={$all : tagsArr}
            }

            if(isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcategory => subcategory.trim());
                filterQuery['subcategory'] = {$all : subcatArr}
            }
        }
        const blogs = await blogModel.find(filterQuery)
        if( blogs.length === 0 ) {
            res.status(404).send( { status : false , message : "No Blogs Found" } )
            return
        }
   
        res.status(200).send( { status : true , message : 'blogs List',Count:blogs.length, Data : blogs  } )
    

    } catch (err) {
        res.status(500).send( { Status : false ,Error: err.message } )
    }
}



const updateblog = async function (req, res) {
    try {
        if(Object.keys(req.body).length==0){
            return res.status(400).send({status:false,message:"Please input some data "})
        }
        let blogid = req.params.blogId
        let check = await blogModel.findById(blogid)
        let checking = check.isDeleted
        if (checking == true) return res.status(404).send({ status: false, msg: "blog has been already deleted" })
        let update = await blogModel.findOneAndUpdate({ _id: blogid },{$set:{ isPublished: true,publishedAt:new Date() }}, { new: true })

       const {title, body, tags, category, subcategory, isPublished} = req.body
        const updateBlogData = {}


        if(isValid(title)) {
            updateBlogData['title'] = title
        }
         

        if(isValid(body)) {
            updateBlogData['body'] = body
        }

        if(isValid(category)) {
            updateBlogData['category'] = category
        }
        

if(isValid(tags)) {
    if(Array.isArray(tags)){
   let newTag = check.tags
        for (let i=0;i<tags.length;i++){
            if(typeof tags[i]==="string"){

                if(!newTag.includes(tags[i])){
                    newTag.push(tags[i])
            }
        }else{
                return res.status(400).send({status:false,msg:"tags can be only in string"})
            }

        }
            updateBlogData.tags=newTag
    }
}

if(subcategory) {
    if(Array.isArray(subcategory)){
        let newSubcategory = check.subcategory
        subcategory.filter((ele)=>(typeof ele==="string" && newSubcategory.indexOf(ele) == -1) ? newSubcategory.push(ele) : ele )
        
  updateBlogData.subcategory=newSubcategory
    }
}
        let updated = await blogModel.findOneAndUpdate({ _id: blogid }, updateBlogData, { new: true })
           return res.status(200).send({ msg: updated });

    } catch (err) {
        return res.status(500).send({ msg: err.mesage })
    }   
}



const deleteById = async (req, res) => {

     try {
        let id = req.params.blogId
        let data = await blogModel.findById(id)
        if (data) {
            if (data.isDeleted == false) {
                let Data2 = await blogModel.findOneAndUpdate({ _id: id }, { isDeleted: true, deleteAt: new Date() }, { new: true })
                return res.status(200).send({ status: true,msg: "data deleted",data:Data2 })

            }
            else {
                return res.status(200).send({ msg: "data already deleted" })
            }

        } else {
            return res.status(404).send({ msg: "id does not exist" })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.massage })
    }
}



/////     DeleteBy_QueryParams      /////

const DeleteBy_QueryParams = async (req, res) => {

    try {

       const filterQuery = {isDeleted : false , deleteAt : null }
       const queryParams = req.query

       let keys = Object.keys(queryParams);
      for(let i=0; i<keys.length; i++){
          if(!(queryParams[keys[i]])) return res.status(400).send({status:false, message:"Please provide proper filters"})
      }

       if(!isValidRequestBody(queryParams)) {
           res.status(400).send({status: false, message: 'No query params received '})
           return
       }
       
       const {authorId, category, tags, subcategory, isPublished}= queryParams

       if(isValid(authorId) && isValidObjectId(authorId)) {
           filterQuery['authorId'] = authorId
       }

       if(isValid(category)) {
           filterQuery['category'] = category.trim()
       }

       if(isValid(isPublished)) {
           filterQuery['isPublished'] = isPublished
       }

       if(isValid(tags)) {
        const tagsArr = tags.trim().split(',').map(tag => tag.trim());
        filterQuery['tags'] = {$all : tagsArr}
       }

       if(isValid(subcategory)) {
        const subcatArr = subcategory.trim().split(',').map(subcategory => subcategory.trim());
        filterQuery['subcategory'] = {$all : subcatArr}
       }

       
       const blogs = await blogModel.find(filterQuery)

       if(blogs.length === 0 ) {
        return res.status(404).send( { status : false , message : "No Blogs Found" } )

       }
    
      await blogModel.updateMany(filterQuery, {$set : {isDeleted : true , deleteAt : new Date()}},{new:true} )
      return res.status(200).send({ status: true, message: 'Blogs Deleted Successfully'} );

    } catch (error) {
        res.status(500).send({ Err: error.message })
    }
}








module.exports.createblog = createblog;
module.exports.getblog = getblog;
module.exports.updateblog = updateblog;
module.exports.deleteById = deleteById;
module.exports.DeleteBy_QueryParams = DeleteBy_QueryParams;












