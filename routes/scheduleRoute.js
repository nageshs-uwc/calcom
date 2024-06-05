const schedule=require('../controllers/scheduleController');
const express= require('express')
const router=express.Router()

router
.route('/')
.post(schedule.createschedule)
router
.route('/avail')
.post(schedule.getAvail)
router
.route('/slots')
.post(schedule.getslot)
router
.route('/updateavailability')
.post(schedule.updateAvailability)


module.exports=router;