const cloud = require('wx-server-sdk')
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
  console.log(tasks);
  // 2.定时任务是否到达触发时间。只触发一次。
  let now = new Date();
  try {
    console.log("Running execTime Function")
    for (let i = 0; i < tasks.length; i++) {
      var taskDate = new Date(Date.parse(tasks[i].Date))
      if (taskDate.getDay() == now.getDay() && taskDate.getMonth() == now.getMonth() && taskDate.getFullYear() == now.getFullYear()) { // 时间到
      console.log("find one!")
        execTasks.push(tasks[i]); // 存入待执行任务栈
        // 定时任务数据库中删除该任务
        await db.collection('Visits').doc(tasks[i]._id).remove()
      }
    }
  } catch (e) {
    console.error(e)
  }
  // 3.处理待执行任务
  for (let i = 0; i < execTasks.length; i++) {
    let task = execTasks[i];
    console.log(task)
      try {
          console.log("Running reminder")
          const res = await cloud.callFunction({
            // 要调用的云函数名称
            name: 'remindPusher',
            data:{
              id:task._id,
              lazybugs: task.lazybugs
            }
          })
          console.log(res.result)
      } catch (e) {
        console.error(e)
      }
  }
}