function getAvailabilityFromSchedule(schedule) {
    return schedule.reduce((availability, times, day) => {
      const addNewTime = (time) => ({
        days: [day],
        startTime: new Date(time.start).toISOString(),
        endTime: new Date(time.end).toISOString(),
        userId: time.userId || null,
      });
  
      const filteredTimes = times.filter((time) => {
        let idx;
        if (
          (idx = availability.findIndex(
            (schedule) =>
              schedule.startTime === new Date(time.start).toISOString() &&
              schedule.endTime === new Date(time.end).toISOString()
          )) !== -1
        ) {
          availability[idx].days.push(day);
          return false;
        }
        return true;
      });
  
      filteredTimes.forEach((time) => {
        availability.push(addNewTime(time));
      });
  
      return availability;
    }, []);
  }
  
  module.exports = getAvailabilityFromSchedule;