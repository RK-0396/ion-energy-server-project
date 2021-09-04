const mongoose = require("mongoose")

const tempModelScema = new mongoose.Schema({
  sensorId: String,
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  measurements: [Object],
})

const TempModel = mongoose.model("tempModel", tempModelScema)

module.exports = TempModel
