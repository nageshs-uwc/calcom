const users=require('../controllers/usersController');
const express= require('express')
const router=express.Router()

router
.route('/')
.post(users.create)


module.exports=router;