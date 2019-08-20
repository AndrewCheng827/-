const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  try {
    return await db.collection(event.dbName).doc(event.id).update({
      data: {
        isAlarmed: event.isAlarmed
      }
    })
  } catch (e) {
    console.error(e)
  }
}








