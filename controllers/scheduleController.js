const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getAvailabilityFromSchedule = require("../helper/getavailability");
const moment = require("moment-timezone");

exports.createschedule = async (req, res) => {
  const { name, timeZone, userId } = req.body;

  try {
    // Create the schedule
    const newSchedule = await prisma.Schedule.create({
      data: {
        name,
        timeZone,
        userId,
      },
    });

    // Create the associated availabilities for Monday to Friday
    const availabilities = [];

    availabilities.push({
      userId,
      scheduleId: newSchedule.id,
      days: [1, 2, 3, 4, 5],
      startTime: new Date(`1970-01-01T09:00:00.000Z`),
      endTime: new Date(`1970-01-01T17:00:00.000Z`),
    });

    // Save all availabilities
    await prisma.availability.createMany({
      data: availabilities,
    });

    res.status(201).json({
      message: "Schedule and availabilities created successfully",
      schedule: newSchedule,
      availabilities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvail = async (req, res) => {
  const { scheduleId } = req.body;

  try {
    // Query the database to get the schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { availabilities: true },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Query the database to get availabilities for the given scheduleId
    const availabilities = schedule.availabilities;

    // Initialize the response object
    const response = {
      id: schedule.id,
      name: schedule.name,
      isManaged: false,
      workingHours: [],
      schedule: [],
      availability: [[], [], [], [], [], [], []], // Array for each day of the week
      timeZone: schedule.timeZone,
      dateOverrides: [],
      isDefault: true,
      isLastSchedule: false,
      readOnly: false,
    };

    // Populate schedule field
    for (const availability of availabilities) {
      response.schedule.push({
        id: availability.id,
        userId: availability.userId,
        eventTypeId: availability.eventTypeId,
        days: availability.days,
        startTime: new Date(
          `1970-01-01T${availability.startTime.toISOString().split("T")[1]}`
        ),
        endTime: new Date(
          `1970-01-01T${availability.endTime.toISOString().split("T")[1]}`
        ),
        date: availability.date,
        scheduleId: availability.scheduleId,
      });
    }

    // Populate availability field
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    availabilities.forEach((availability) => {
      availability.days.forEach((day) => {
        response.availability[day - 1].push({
          start: `${today}T${
            availability.startTime.toISOString().split("T")[1]
          }`,
          end: `${today}T${availability.endTime.toISOString().split("T")[1]}`,
        });
      });
    });

    // Populate workingHours field
    const workingHoursMap = new Map();
    for (const availability of availabilities) {
      const startTime =
        availability.startTime.getUTCHours() * 60 +
        availability.startTime.getUTCMinutes();
      const endTime =
        availability.endTime.getUTCHours() * 60 +
        availability.endTime.getUTCMinutes();

      const key = `${startTime}-${endTime}`;
      if (!workingHoursMap.has(key)) {
        workingHoursMap.set(key, { days: [], startTime, endTime });
      }

      const existingEntry = workingHoursMap.get(key);
      availability.days.forEach((day) => {
        if (!existingEntry.days.includes(day)) {
          existingEntry.days.push(day);
        }
      });
    }

    response.workingHours = Array.from(workingHoursMap.values());

    res.json(response);
  } catch (error) {
    // Handle any errors that occur during processing
    res.status(500).json({ error: error.message });
  }
};

exports.getslot = async (req, res) => {
  const { eventTypeSlug, startTime, endTime, scheduleId, duration, userId,timezone } =
    req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const meetingDuration = duration * 60 * 1000;

  try {
    // Fetch availabilities for the given scheduleId
    const availabilities = await prisma.availability.findMany({
      where: { scheduleId: parseInt(scheduleId) },
    });

    // Fetch bookings within the specified date range
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: { gte: start },
        endTime: { lte: end },
        userId,
      },
    });

    const selectedSlots = await prisma.SelectedSlots.findMany({
      where: {
        userId,
      },
    });

    const response = { slots: {} };
    let date = new Date();


   
    const now = moment.tz(timezone );
    const offset = now.utcOffset()*60*1000

    let currentDate = new Date(
      date.getTime() +offset
     
    );
   
    let currentTime = currentDate.getTime();
    while (currentDate <= end) {
      const weekday = currentDate.getUTCDay();
      const dayAvailabilities = availabilities.filter((avail) =>
        avail.days.includes(weekday)
      ); // Filter availabilities for the current day

      // Iterate over each availability for the current day
      for (const availability of dayAvailabilities) {
        // Set start and end times for the current availability
        let startDt = new Date(
          `${currentDate.toISOString().split("T")[0]}T${
            availability.startTime.toISOString().split("T")[1]
          }`
        );
        let endDt = new Date(
          `${currentDate.toISOString().split("T")[0]}T${
            availability.endTime.toISOString().split("T")[1]
          }`
        );

        // Adjust start and end times if they fall outside the requested range
        if (startDt < start) startDt = start;
        if (endDt > end) endDt = end;

        const slots = []; // Initialize an array to hold time slots
        let currentSlot = new Date(startDt); // Start at the availability start time

        // Generate time slots within the availability window
        while (currentSlot.getTime() + meetingDuration <= endDt.getTime()) {
          const slotEnd = new Date(currentSlot.getTime() + meetingDuration);

          // Check if the current slot coincides with any existing bookings
          const isBooked = bookings.some(
            (booking) =>
              currentSlot < booking.endTime && slotEnd > booking.startTime
          );
          const isSlotselected = selectedSlots.some(
            (slot) =>
              currentSlot < slot.slotUtcEndDate &&
              slotEnd > slot.slotUtcStartDate
          );

          let slotTime = Number(currentSlot.getTime());
       
          if (currentTime <= slotTime) {
            if (!isBooked && !isSlotselected) {
              slots.push({ time: currentSlot.toISOString() }); // Add each time slot to the array
            }
          }

          currentSlot = slotEnd; // Move to the next slot
        }

        // Add the generated slots to the response
        if (slots.length) {
          const dateStr = currentDate.toISOString().split("T")[0]; // Get the date string in YYYY-MM-DD format
          if (!response.slots[dateStr]) response.slots[dateStr] = []; // Initialize the array for the date if it doesn't exist
          response.slots[dateStr] = response.slots[dateStr].concat(slots); // Add the slots to the response
        }
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Move to the next day
    }

    // Send the response back to the client
    res.json(response);
  } catch (error) {
    // Handle any errors that occur during processing
    res.status(500).json({ error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  const { scheduleId, schedule } = req.body;

  const availability = getAvailabilityFromSchedule(schedule);

  const userSchedule = await prisma.schedule.findUnique({
    where: {
      id: scheduleId,
    },
    select: {
      userId: true,
      name: true,
      id: true,
    },
  });
  console.log(userSchedule);
  if (!userSchedule) {
    res.status(404).json({
      error: "Schedule not found",
    });
  }
  const schedules = await prisma.schedule.update({
    where: {
      id: scheduleId,
    },
    data: {
      // timeZone:timeZone,
      // name: name,
      availabilities: {
        deleteMany: {
          scheduleId: {
            equals: scheduleId,
          },
        },
        createMany: {
          data: [...availability],
        },
      },
    },
    select: {
      id: true,
      userId: true,
      name: true,
      availabilities: true,
      // timeZone: true,
      // eventType: {
      //   select: {
      //     id: true,
      //     eventName: true,
      //   },
      // },
    },
  });

  res.json({ schedules });
};
