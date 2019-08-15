const cloud = require('wx-server-sdk')
const templateMessage = require('templateMessage.js')

const COLL_FIELD_NAME = 'publicField';
const FIELD_NAME = 'ACCESS_TOKEN'

const MSGID = '你的模板消息ID';

cloud.init({
  env: 'cloud-o1n8p'
})
const db = cloud.database()

const remind = async activity_id => {

  // 根据活动id，获取参与用户信息，获取到用户的 openid 和 formid.

  // 开奖程序省略

  // 从数据库中获取AccessToken
  let tokenRes = await db.collection(COLL_FIELD_NAME).doc(FIELD_NAME).get();
  let token = tokenRes.data.token; // access_token

  let page = '点击模板消息，想要打开的小程序页面';
  let msgData = {
    "keyword1": {
      "value": activity.prizeName
    },
    "keyword2": {
      "value": "你参与的抽奖活动正在开奖，点击查看中奖名单"
    },
  };

  let openid = '用户openid';
  let formid = '用户formid';

  await templateMessage.sendTemplateMsg(token, MSGID, msgData, openid, formid, page);
}

module.exports = {
  kai: remind,
}