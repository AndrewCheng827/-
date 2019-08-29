const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  try {
    console.log("Updating activity...")
    
    
    console.log(event.execTime,event.Time,event.Date)
    
    var execTime = new Date(event.execTime);
    var date = new Date(event.Date);

    return await db.collection('Visits').doc(event.id).update({
      data: {
        execTime: execTime,
        Time: event.Time,
        Date: date,
        location: event.location,
        description: event.description
      }
    })
  } catch (e) {
    console.error(e)
  }
}








