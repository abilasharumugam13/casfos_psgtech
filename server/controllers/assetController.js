const Asset = require("../model/Asset");
const ConfirmedAsset = require("../model/ConfirmedAsset");
const UpdatesAsset = require("../model/UpdatesAsset");
const RejectedAsset = require("../model/RejectedAsset");
exports.saveAssetData = async (req, res) => {
  const { assetType, location, data } = req.body;

  if (!assetType || !location || !data) {
    return res.status(400).send("Asset Type, Location, and Data are required.");
  }

  try {
    // Check if an asset with the same assetType and location already exists
    const existingAsset = await ConfirmedAsset.findOne({ assetType, location });

    if (existingAsset) {
      // If asset exists, compare it with the new data
      const previousData = existingAsset.data;

      // Find differences between previousData and new data
      const newData = { ...data };

      // Compare the data to find differences (for simplicity, we assume it's done via deep comparison)
      const isDifferent = JSON.stringify(previousData) !== JSON.stringify(newData);

      if (isDifferent) {
        // If there are differences, create an entry in UpdatesAsset collection
        const update = new UpdatesAsset({
          assetType,
          location,
          previousData,
          newData,
        });

        await update.save();


        return res.status(200).send("Asset data updated successfully, changes recorded.");
      }

      return res.status(200).send("No changes detected.");
    } else {
      // If asset does not exist, create a new one
      const assetRecord = new Asset({
        assetType,
        location,
        data,
      });
      await assetRecord.save();
      return res.status(200).send("Asset data saved successfully.");
    }
  } catch (error) {
    console.error("Error saving or updating asset data:", error);
    res.status(500).send("Failed to save or update data.");
  }
};

exports.getAssetData = async (req, res) => {
  const { assetType, location } = req.body;

  try {
    const confirmedAsset = await ConfirmedAsset.findOne({ assetType, location });
    if (confirmedAsset) {
  
      return res.status(200).json({
        message: "Data found in confirmed assets",
        data: confirmedAsset.data,
        status: "confirmed",
      });
    }
    const rejectedAsset = await RejectedAsset.findOne({ assetType, location });
    if(rejectedAsset)
    {
      return res.status(200).json({
        message: "Data Entry is rejected",
        data: rejectedAsset.data,
        status: "rejected",
      });
    }
    // Check in Asset collection
    const asset = await Asset.findOne({ assetType, location });
    if (asset) {
      return res.status(200).json({
        message: "Asset entry waiting for confirmation",
        data: asset.data,
        status: "pending",
      });
    }

    // If not found in both collections
    return res.status(200).json({ message: "No data found" });
  } catch (err) {
    console.error("Error fetching asset data:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.rejectUpdatedAsset = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  // Check if remark is provided
  if (!remark) {
    return res.status(400).json({ message: "Remark is required for rejection." });
  }

  try {
    // Fetch the asset
    const asset = await UpdatesAsset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    // Move asset to RejectedAsset collection
    const rejectedAsset = new RejectedAsset({ ...asset.toObject(), remark });
    await rejectedAsset.save();

    // Remove the asset from ConfirmedAsset collection
    await UpdatesAsset.findByIdAndDelete(id);

    res.status(200).json({ message: "Asset rejected successfully with remark." });
  } catch (error) {
    console.error("Error rejecting asset:", error);
    res.status(500).json({ message: "Error rejecting asset.", error });
  }
};
exports.rejectAsset = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  // Check if remark is provided
  if (!remark) {
    return res.status(400).json({ message: "Remark is required for rejection." });
  }

  try {
    // Fetch the asset
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    // Move asset to RejectedAsset collection
    const rejectedAsset = new RejectedAsset({ ...asset.toObject(), remark });
    await rejectedAsset.save();

    // Remove the asset from ConfirmedAsset collection
    await Asset.findByIdAndDelete(id);

    res.status(200).json({ message: "Asset rejected successfully with remark." });
  } catch (error) {
    console.error("Error rejecting asset:", error);
    res.status(500).json({ message: "Error rejecting asset.", error });
  }
};
exports.approveAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the asset
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Move to confirmed collection
    await ConfirmedAsset.create(asset.toObject());

    await asset.deleteOne();

    res.status(200).json({ message: "Asset approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving asset", error });
  }
};
exports.approveUpdatedAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the asset from UpdatesAsset collection
    const asset = await UpdatesAsset.findById(id);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const { assetType, location, newData } = asset;

    // Find the corresponding document in ConfirmedAsset collection
    const confirmedAsset = await ConfirmedAsset.findOne({ assetType, location });

    if (!confirmedAsset) {
      return res.status(404).json({ message: "Corresponding confirmed asset not found" });
    }

    // Update the 'data' field with 'newData' from the updated asset
    confirmedAsset.data = newData;

    // Save the updated confirmed asset
    await confirmedAsset.save();

    // Delete the updated asset from UpdatesAsset collection
    await asset.deleteOne();

    res.status(200).json({ message: "Asset approved and updated successfully" });
  } catch (error) {
    console.error("Error approving updated asset:", error);
    res.status(500).json({ message: "Error approving updated asset", error });
  }
};

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assets", error });
  }
};
exports.filterAssets = async (req, res) => {
  const { assetType, location, accessories } = req.body;

  // Construct query object based on provided filters
  const query = {};

  if (assetType) {
    // Check if the assetType ends with "s" for full word matching
    if (assetType.endsWith('s')) {
      query.assetType = { $regex: new RegExp(assetType, 'i') }; // Exact match, case-insensitive
    } else {
      query.assetType = { $regex: new RegExp(`^${assetType}`, 'i') }; // Partial match, case-insensitive
    }
  }
  
  if (location) {
    query.location = { $regex: new RegExp(location, 'i') }; // Case-insensitive matching
  }

  try {
    // Fetch assets matching the assetType and location
    const assets = await ConfirmedAsset.find(query);

    // If accessories filter is provided, further filter the assets based on the accessories data
    const filteredAssets = assets
      .map((asset) => {
        if (accessories) {
          // Filter the data field for the matching accessory and quantity (case-insensitive)
          const matchingAccessory = Object.keys(asset.data).find((key) =>
            key.toLowerCase().includes(accessories.toLowerCase())
          );

          if (matchingAccessory) {
            // Return the asset with only the matching accessory and its quantity
            return {
              ...asset.toObject(),
              data: { [matchingAccessory]: asset.data[matchingAccessory] },
            };
          }
        } else {
          // If no accessories filter, return the asset as is
          return asset;
        }
      })
      .filter((asset) => asset); // Remove undefined entries (assets that didn't match the filter)

    if (filteredAssets.length > 0) {
      res.status(200).json(filteredAssets); // Return the filtered results
    } else {
      res.status(404).json({ message: "No matching records found." }); // No matches
    }
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ message: "Internal Server Error" }); // Handle any server errors
  }
};

exports.getUpdatedAssets = async (req, res) => {
  try {
    const updatedAssets = await UpdatesAsset.find();
    res.json(updatedAssets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching updated assets" });
  }
};

exports.rejectedassets = async (req, res) => {
  try {
    const assets = await RejectedAsset.find();
    res.json(assets);  // Change this to return JSON
  } catch (error) {
    res.status(500).send('Error fetching rejected assets');
  }
};
exports.getRejectedAssetData = async (req, res) => {
  console.log('entered');

  const { assetTypeParam, locationParam } = req.body;
  try {
    const assetType = assetTypeParam;
    const location = locationParam;
    const rejectedAssets = await RejectedAsset.findOne({ assetType, location });
    if (rejectedAssets.length === 0) {
      return res.status(200).json({ message: "No rejected assets found" });
    }
    if(rejectedAssets.data)
    {
      return res.status(200).json({
        message: "Rejected assets found",
        data: rejectedAssets.data,
        status: "confirmed",
      });
    }
    else{
      return res.status(200).json({
        message: "Rejected assets found",
        data: rejectedAssets.previousData,
        status: "confirmed",
      });
    }
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching rejected assets" });
  }
};

exports.removeRejectedData = async (req, res) => {
  const { assetType, location, data } = req.body;

  if (!assetType || !location || !data) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    // Log the incoming data for debugging

    // Step 1: Find and delete the rejected asset
    const deletedRejectedAsset = await RejectedAsset.findOneAndDelete({ assetType, location });

    if (!deletedRejectedAsset) {
      return res.status(404).json({ success: false, message: "Rejected asset not found." });
    }

    // Step 2: Add the new entry to the Asset collection
    const assetRecord = new Asset({
      assetType,
      location,
      data,
    });

    await assetRecord.save();

    return res.status(200).json({ success: true, message: "Rejected asset removed, and new asset saved successfully." });

  } catch (error) {
    console.error("Error in removeRejectedData:", error);
    return res.status(500).json({ success: false, message: "Server error occurred while processing the request." });
  }
};

exports.getAssetEntriesByMonth = async (req, res) => {
  try {
    const assets = await ConfirmedAsset.find({});
    const monthlyCounts = Array(12).fill(0);

    assets.forEach((asset) => {
      const month = new Date(asset.joined).getUTCMonth(); // Extract month
      monthlyCounts[month]++;
    });
    
    res.json({
      labels: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      data: monthlyCounts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching asset data.' });
  }
};

