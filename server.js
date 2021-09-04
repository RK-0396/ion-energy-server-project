const express = require("express")
const cors = require('cors')
const fileUpload = require("express-fileUpload")
const Temperature = require("./ion-database/db-model.js")
const app = express()
const connectDB = require("./ion-database/db-connection")
const serverPort = 3000;
const crossOrigin = 'http://localhost:4200'

var corsOptions = {
  origin: crossOrigin,
}

app.use(fileUpload())
app.use(cors(corsOptions));
app.use(express.json())

connectDB()

app.post("/uploadFile", async (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: "No file was uploaded" })
  }

  const file = req.files.file

  const fileName = file.name
  const fileData = JSON.parse(file.data)

  let dataArr = []
  let startDate = fileData[0].ts
  let tempDoc = {}
 for(let i=0; i< fileData.length; i++) {
    const data = fileData[i]
    const currTs = data.ts
    const tempVal = data.val

    if (i + 1 < fileData.length) {
      const getCurrYear = parseInt(new Date(currTs).getFullYear())
      const getNextYear = parseInt(new Date(fileData[i + 1].ts).getFullYear())

      if (getNextYear === getCurrYear) {
        dataArr.push({
          ts: currTs,
          val: tempVal,
        })
     } else {
       endDate = fileData[i].ts
        dataArr.push({
          ts: currTs,
          val: tempVal,
        })

        tempDoc = new Temperature({
          sensorId: fileName.substring(0, fileName.length - 5),
          startDate: startDate,
          endDate: endDate,
          measurements: dataArr,
        })

        try {
          await tempDoc.save()
        } catch (err) {
          return console.error(err)
        }

        dataArr = []
        startDate = fileData[i + 1].ts
      }
    } else {
      endDate = fileData[i].ts

      tempDoc = new Temperature({
        sensorId: fileName.substring(0, fileName.length - 5),
        startDate: startDate,
        endDate: endDate,
        measurements: dataArr,
      })

      try {
        await tempDoc.save(function (err, data) {
          if (err) return console.error(err)
          console.log("Saved to temperature collection.")
        })
      } catch (err) {
        return console.error(err)
      }
    }
  }
  file.mv(`${__dirname}/ion-database/uploads/${file.name}`, (err) => {
    if (err) {
      console.log(err)
      return res.status(500).send(err)
    }
    res.status(200).json({ fileName: file.name, msg: "file uploaded on server" })
  })
})

app.get("/tempData", async (req, res) => {
  try {
    const results = Temperature.find({}, { measurements: 1, sensorId: 1 })

    results.exec(function (err, data) {
      if (err) {
        console.log(err)
      }
      res.status(200).json({
        status: "success",
        measurements: data[0].measurements,
        sensorId: data[0].sensorId,
      })
    })

    const result = await Temperature.deleteMany({})
  } catch (err) {
    throw err
  }
})

app.listen(serverPort, () => {
  console.log(`Server started on port ${serverPort}`)
})
