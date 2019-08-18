const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  try {
    var lazybug = {
      openId:event.openId,
      formId: event.formId
    }
    return await db.collection(event.dbName).doc(event.id).update({
      data: {
        lazybugs: _.push(lazybug),
        isAlarmed: event.isAlarmed
      }
    })
  } catch (e) {
    console.error(e)
  }
}








