const authorModel = require("../Models/authorModel")
const jwt = require("jsonwebtoken");

const isValid = function(value) {
    if(typeof value === 'undefined' || value === "null") return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true ;
}


const createAuthor = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(req.body) == 0) return res.status(400).send('Data is missing')
    
        const { fname, lname, title, email, password } = data

        const req0 = isValid(fname)
        if (!req0) return res.status(400).send('fname is required')

        const req1 = isValid(lname)
        if (!req1) return res.status(400).send('lname is required')

        const req2 = isValid(title)
        if (!req2) return res.status(400).send('title is required')

        const req3 = isValid(email)
        if (!req3) return res.status(400).send('email is required')

        const req4 = isValid(password)
        if (!req4) return res.status(400).send('password is required')

        if (password.trim().length < 3 || password.trim().length > 16) {
            return res.status(400).send({status:false, msg:"password should be 3 to 16 characters"})
        }



   const isValidTitle = function (title) {
            return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
        }


        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: `${title} title is not valid` })
        }
          
       if(!(/^([\w]*[\w\.]*(?!\.)@gmail.com)$/.test(email))){
            return res.status(400).send({status : false, message : `${email} email is not valid`})
        }
        
        const isEmailAlreadyUsed = await authorModel.findOne({ email });

        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, msg: `${email} email address is already registered` })
        }

        let dataRes = await authorModel.create(data)
        return res.status(201).send({ status: true, message: 'Author created successfully', result: dataRes })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const loginauthor = async function (req, res) {
    try {
        if (Object.keys(req.body) == 0) return res.status(400).send('Data is missing')
        const { email, password } = req.body
        const req7 = isValid(email)
        if (!req7) return res.status(400).send('email is required')

        const req8 = isValid(password)
        if (!req8) return res.status(400).send('password is required')

        let authorDetails = await authorModel.findOne({ email: email })
        let authorDetails1 = await authorModel.findOne({ password: password })

        if (authorDetails && authorDetails1) {
            const  token =  jwt.sign({
                authorId :authorDetails._id,
                email: email ,
             },'Blog-Project',{expiresIn:"1h"})

            
            return res.status(200).send({ status: true, message: 'Author login successfully', token: token })
        } else {

            if (!authorDetails) {
                return res.status(400).send({ status: false, message: "Invalid Email" })
            }
            else if (!authorDetails1) {
                return res.status(400).send({ status: false, message: "invalid password" })
            }
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createAuthor = createAuthor
module.exports.loginauthor = loginauthor



















