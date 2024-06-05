const event=require('../controllers/eventTypeController');
const express= require('express')
const router=express.Router()

router
.route('/')
.post(event.createEvent)

module.exports=router;