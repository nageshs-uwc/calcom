const slots=require('../controllers/selectedSlotController');
const express= require('express')
const router=express.Router()

router
.route('/')
.post(slots.reserveSlotHandler)
router
.route('/release')
.post(slots.releaseSlot)


module.exports=router;