const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  try {
    console.log("Updating activity...")
    
    
    console.log("execTime: " ,event.execTime, "time: " ,event.Time, "date: " ,event.Date)
    
    var execTime = new Date(event.execTime);

    return await db.collection('Visits').doc(event.id).update({
      data: {
        execTime: execTime,
        Time: event.Time,
        Date: event.Date,
        location: event.location,
        description: event.description
      }
    })
  } catch (e) {
    console.error(e)
  }
}








