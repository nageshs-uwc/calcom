const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const dayjs=require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const cookie = require('cookie'); 

exports.reserveSlotHandler=async (req,res)=>{
    const uid= req?.cookies?.uid || uuidv4();
    const { slotUtcStartDate, slotUtcEndDate, eventTypeId,userId } = req.body;
    const releaseAt = dayjs.utc().add(parseInt("15"), "minutes").format();
    const start = new Date(slotUtcStartDate);
    const end = new Date(slotUtcEndDate);
    // const eventType = await prisma.eventType.findUnique({
    //     where: { id: eventTypeId },
    //     select: { users: { select: { id: true } } },
    //   });
      
    //   console.log(eventType)
    
    //need to check first if new slot is coinciding with the bookings

    const existingBooking = await prisma.booking.findFirst({
        where: {
          userId: userId,
          OR: [
            {
              startTime: { lte: end },
              endTime: { gte: start }
            }
          ]
        }
      });
  console.log(existingBooking)
      if (existingBooking) {
        return res.status(400).json({ message: 'Time slot is Not available,please select different slot' });
      }
      
      try {
      
          await prisma.SelectedSlots.upsert({
            where: { selectedSlotUnique: { userId , slotUtcStartDate, slotUtcEndDate, uid } },
            update: {
              slotUtcStartDate,
              slotUtcEndDate,
              releaseAt,
              eventTypeId,
            },
            create: {
              userId,
              eventTypeId,
              slotUtcStartDate,
              slotUtcEndDate,
              uid,
              releaseAt,
             
            },
          })
      
      // Set the cookie header before sending the response
      res.setHeader("Set-Cookie", cookie.serialize("uid", uid, { path: "/", sameSite: "lax" }));
      res.json({ uid });
    } catch (error) {
      // Send error response only if the initial response hasn't been sent
      if (!res.headersSent) {
        res.status(500).json({ message: "An error occurred", error: error.message });
      }
    }

    res.json({})
     
}

exports.releaseSlot=async (req,res)=>{
    const uid= req?.cookies?.uid || req.body.uid
    if (uid) {
        await prisma.selectedSlots.deleteMany({ where: { uid: { equals: uid } } });
      }

      res.json({
        message: "Slot released successfully"
      })
   
}