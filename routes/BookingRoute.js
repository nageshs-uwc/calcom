const booking=require('../controllers/bookingController');
const express= require('express')
const router=express.Router()

router
.route('/')
.post(booking.createBooking)
router
.route('/delete')
.post(booking.deleteBooking)


module.exports=router;