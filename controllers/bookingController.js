const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createBooking=async (req, res) => {
    const { userId, startTime, endTime, bookedBy,eventTypeId,email } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);
    try {
      // Check if the time slot is already booked
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
  
      if (existingBooking) {
        return res.status(400).json({ message: 'Time slot is Not available,please select different slot' });
      }
      
  

  
      // Create a new booking
      const newBooking = await prisma.booking.create({
        data: {
          userId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          bookedBy,
          eventTypeId,
          email
        }
      });
  
      res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  exports.deleteBooking = async (req,res)=>{
    const { id } = req.body;
  
    try {
      // Check if the time slot is already booked
      const existingBooking = await prisma.booking.delete({
        where: {
       id
        }
      });
      res.json({
        message:"booking is cancelled"
      })
  }catch(e) {
    res.json({ error: e})
  }
}