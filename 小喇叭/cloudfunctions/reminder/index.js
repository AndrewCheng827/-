const cloud = require('wx-server-sdk')
const COLL_FIELD_NAME = 'publicField';
const FIELD_NAME = 'ACCESS_TOKEN'
const MSGID = "gZnL146J6KIF8TxzbYByfl-p90dFo03VJL7zRt3ujEY"
cloud.init({
  env: 'cloud-o1n8p'
})
const db = cloud.database()

exports.main = async (event, context) => {
  console.log("running main function...")
  const execTasks = []; // 待执行任务栈
  // 1.查询是否有定时任务。（Visits)集合是否有数据。
  let taskRes = await db.collection('Visits').limit(100).get()
  let tasks = taskRes.data;
  // 2.定时任务是否到达触发时间。只触发一次。
  let now = new Date();
  console.log(now);
  try {
    console.log("Running execTime Function")
    for (let i = 0; i < tasks.length; i++) {
      console.log(tasks[i].execTime);
      console.log(now);
      if (tasks[i].execTime.getFullYear() == now.getFullYear() && tasks[i].execTime.getMonth() == now.getMonth() && tasks[i].execTime.getDate() == now.getDate() && tasks[i].execTime.getHours() == now.getHours() && tasks[i].execTime.getMinutes() == now.getMinutes()) { // 时间到
      console.log("find one!")
        execTasks.push(tasks[i]); // 存入待执行任务栈

      }
    }
  } catch (e) {
    console.error(e)
  }
  // 3.处理待执行任务
  for (let i = 0; i < execTasks.length; i++) {
    let task = execTasks[i];
    console.log(task)
    console.log(task.lazybugs)
    // 从数据库中获取AccessToken
    let tokenRes = await db.collection(COLL_FIELD_NAME).doc(FIELD_NAME).get();
    let token = tokenRes.data.token; // access_token
    let page = 'pages/index/index';
    let msgData = {
      keyword1: {
        value: task.description
      },
      keyword2: {
        value: task.Date
      },
      keyword3: {
        value: task.location
      }
    };

    for (var j = 0; j < task.lazybugs.length; j++) {
      try {
        let openId = task.lazybugs[j].openId;
        let formId = task.lazybugs[j].formId;
        const res = await cloud.callFunction({
          // 要调用的云函数名称
          name: 'remindPusher',
          data: {
            token: token,
            MSGID: MSGID,
            msgData: msgData,
            openId: openId,
            formId: formId,
            page: page
          } 
        })

        return res
      } catch (err) {
        console.log(err)
        return err
      }
    } 
  }
}