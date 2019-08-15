const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const APPID = '你的APPID';
const APPSECRET = '你的APPSECRET';
const COLLNAME = 'publicField';
const FIELDNAME = 'ACCESS_TOKEN'

cloud.init({
  env: '你的云环境ID'
})
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