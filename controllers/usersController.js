const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create=async (req,res,next)=>{
    const { name } = req.body;
    const user = await prisma.user.create({
      data: { name },
    });
    res.json(user);
} 