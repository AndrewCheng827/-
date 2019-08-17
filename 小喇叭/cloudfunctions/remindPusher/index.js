const cloud = require('wx-server-sdk')
cloud.init();

const db = cloud.database()

exports.main = async (event, context) => {
  console.log("running remindPusher")
  const rp = require('request-promise');
  var token = event.token;
  var msgId = event.MSGID;
  var msgData = event.msgData;
  var openId = event.openId;
  var formId = event.formId;
  var page = event.page;
  console.log("All checked sending request now")
    await rp({
      json: true,
      method: 'POST', 
      uri: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + token,
      body: {
        touser: openId,
        template_id: msgId,
        page: page,
        form_id: formId,
        data: msgData
      }
    })
  console.log("All Done.")
}

/*
  const activity = await db.collection('Visits').doc(event._id).get();
  console.log(activity)
  console.log(event.lazybugs)
  var lazybug = {};
*/