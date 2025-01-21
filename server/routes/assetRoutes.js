// routes/assetRoutes.js
const express = require("express");
const router = express.Router();
const AssetController = require("../controllers/assetController");

router.post("/saveAssetData", AssetController.saveAssetData);
router.post("/getAssetData", AssetController.getAssetData);  // Use AssetController.getAssetData
router.post("/approve/:id", AssetController.approveAsset);
router.post("/approveupdated/:id", AssetController.approveUpdatedAsset);
router.post("/reject/:id", AssetController.rejectAsset);
router.post("/rejectupdated/:id", AssetController.rejectUpdatedAsset);
router.get("/getAllAssets", AssetController.getAllAssets);
router.post("/filterAssets", AssetController.filterAssets);
router.get("/getUpdatedAssets", AssetController.getUpdatedAssets);
router.get("/rejectedassets", AssetController.rejectedassets);
router.post("/getRejectedAssetData", AssetController.getRejectedAssetData);
router.post("/removeRejectedData", AssetController.removeRejectedData);
router.get("/monthly",AssetController.getAssetEntriesByMonth);
module.exports = router;
