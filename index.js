const express = require('express');


const userRoute=require('./routes/usersRoute');
const scheduleRoute = require('./routes/scheduleRoute');
const BookingRoute = require('./routes/BookingRoute');
const eventRoute = require('./routes/eventTypeRoutes');
const selectedSlots = require('./routes/selectedSlotRoutes');

const app = express();
app.use(express.json());

app.use('/users',userRoute)
app.use('/schedule',scheduleRoute)
app.use('/booking',BookingRoute)
app.use('/eventType',eventRoute)
app.use('/selectedSlots',selectedSlots)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});