const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  remark: { type: String, required: true },
  location: { type: String, required: true },
  joined: {
    type: Date,
    default: () => {
      // Get the current date in UTC
      let date = new Date();

      // Convert to IST (UTC+5:30)
      let istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30 hours
      let istDate = new Date(date.getTime() + istOffset);

      return istDate;
    },
  },
  // Fields for Doc1
  data: { type: Object, required: function () { return !this.newData && !this.previousData; } },

  // Fields for Doc2
  newData: { type: Object, required: function () { return !this.data; } },
  previousData: { type: Object, required: function () { return !this.data; } },
});

const RejectedAsset = mongoose.model("RejectedAsset", AssetSchema);

module.exports = RejectedAsset;
