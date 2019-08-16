const cloud = require('wx-server-sdk')
cloud.init();

const db = cloud.database()

exports.main = async (event, context) => {
  console.log("running remindPusher")
  const activity = await db.collection('Visits').doc(event._id).get();
  console.log(activity)
  for(var i = 0; i < event.lazybugs.length; i++){
    try {
      const result = await cloud.openapi.templateMessage.send({
        touser: event.lazybugs[i].openId,
        data: {
          keyword1: {
            value: activity.data.description
          },
          keyword2: {
            value: activity.data.Date
          },
          keyword3: {
            value: activity.data.location
          }
        },
        templateId: 'gZnL146J6KIF8TxzbYByfl-p90dFo03VJL7zRt3ujEY',
        formId: event.lazybugs[i].formId,
        emphasisKeyword: 'keyword1.DATA'
      })
      console.log(result)
      return result
    } catch (err) {
      console.log(err)
      return err
    }
  }


}