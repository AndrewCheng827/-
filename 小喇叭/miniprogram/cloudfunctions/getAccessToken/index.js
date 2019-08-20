const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const APPID = 'wx45596932742f1632';
const APPSECRET = '8a66a968cc0805c24f341f651802f0d4';
const COLLNAME = 'publicField';
const FIELDNAME = 'ACCESS_TOKEN'

cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    let res = await rq({
      method: 'GET',
      uri: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET,
    });
    res = JSON.parse(res)

    let resUpdate = await db.collection(COLLNAME).doc(FIELDNAME).update({
      data: {
        token: res.access_token
      }
    })
  } catch (e) {
    console.error(e)
  }
}