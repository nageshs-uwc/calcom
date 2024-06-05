const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createEvent= async (req, res) => {
    const { title, slug, description, position, length,userId } = req.body;
  
    try {
      // Create the event type
      const newEventType = await prisma.eventType.create({
        data: {
          title,
          slug,
          description,
          userId,
        //   position,
          length,
        //   hidden,""
        },
      });
  
      res.status(201).json({ message: 'EventType created successfully', eventType: newEventType });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }