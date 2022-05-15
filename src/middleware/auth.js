
const jwt = require("jsonwebtoken");
const authorModel = require("../Models/authorModel")
const blogModel = require("../Models/blogModel")

const authenticate= function(req,res,next){
    try {
        const token = req.headers["x-api-key"]
        if (!token) { return res.status(404).send({status : false,msg:"token must be present"}) }
                    jwt.verify(token, 'Blog-Project',async (err,decodedToken)=>{
            if(err){
                 return res.status(401).send({status : false,msg:err.message}) 
            }
             const userRes= await authorModel.findById(decodedToken.authorId) 
          req.decodedToken=decodedToken// dont't want to kill request means still want to use decoded token
            if(!userRes){
                return res.status(401).send({status : false,msg:"you are unauthenticated,please register your account"}) 
            }
         next()
        })
    } catch (err) {
        return res.status(500).send({status : false, error: err.message })
    }
}

const authorise = function(req,res,next) { 
    try {
        if (Object.keys(req.body) == 0) { 
            return res.status(400).send("data is missing") 
        }
         if(req.body.authorId===undefined)
        return res.status(400).send("authorId is required")
    let authortobemodified = req.body.authorId

    let decodedToken=req.decodedToken//syntax need to write in reverse order
    let authorloggedin = decodedToken.authorId
   if(authortobemodified!= authorloggedin ) {
        return res.status(400).send({status:false, msg:" loggedin person is not allow to create data"})
    }
    next()
    }
    catch(err) {
        res.status(500).send({status: false, error: err.message})
    }
}

const authorisation = async function (req, res, next) {
  try {
 
    let blogId = req.params.blogId
    let findBlog = await blogModel.findById(blogId)
    if(!findBlog) return res.status(404).send({msg : "Blog not found"})
    let authortobemodified = findBlog.authorId 
    let token = req.headers["x-api-key"];
    let decodedtoken = jwt.verify(token, "Blog-Project")
    let userloggedin = decodedtoken.authorId

    if (authortobemodified != userloggedin) return res.send({ status: false, msg: "user is not allowed to modify other's blog" })

    next()
  }
catch(err) {
    res.status(500).send({status: false, error: err.message})
}
}

module.exports.authenticate = authenticate
module.exports.authorise= authorise
module.exports.authorisation = authorisation