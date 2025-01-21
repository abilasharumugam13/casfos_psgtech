const AdminModel = require('../model/AdminModel');
const DataEntryModel = require('../model/DataEntryModel');
const ViewerModel = require('../model/ViewerModel');
const { TemporaryUser} = require('../model/UserModel'); 
const RejectedUser = require('../model/RejectedUserModel');

const registerUser = async (req, res) => {
    const { name, password, email, role } = req.body;

    try {
        const newUser = new TemporaryUser({
            name,
            password,
            email,
            role,
        });

        // Save the user
        await newUser.save();
        res.json('success');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Approve a user and move them to their respective role collection
const approveUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the user in the TemporaryUser collection
        const user = await TemporaryUser.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let Model;

        // Determine the role-based collection
        switch (user.role) {
            case 'admin':
                Model = AdminModel;
                break;
            case 'dataentry':
                Model = DataEntryModel;
                break;
            case 'user':
                Model = ViewerModel;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        // Move the user to the role-specific collection
        const newUser = new Model({
            name: user.name,
            password: user.password, // Keep the same password
            email: user.email,
            role: user.role,
        });

        await newUser.save();
        await TemporaryUser.findByIdAndDelete(id); // Remove from the temporary collection

        res.status(200).json({ message: 'User approved and moved to their role-specific collection' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving user', error });
    }
};

// Login function remains unchanged
const loginUser = async (req, res) => {
    const { name, password, role } = req.body;

    try {
        let Model;

        // Determine the model based on the role
        switch (role) {
            case 'admin':
                Model = AdminModel;
                break;
            case 'dataentry':
                Model = DataEntryModel;
                break;
            case 'user':
                Model = ViewerModel;
                break;
            default:
                return res.status(400).json('Invalid role');
        }

        const user = await Model.findOne({ name });
        if (!user) {
            return res.status(404).json('User not found');
        }

        if (user.password !== password) {
            return res.status(401).json('Wrong password');
        }

        res.json('success');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all temporary users
const getTemporaryUsers = async (req, res) => {
    try {
        const users = await TemporaryUser.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

const rejectUser = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  if (!remark) {
    return res.status(400).json({ message: "Remark is required for rejection." });
  }
  console.log(remark)
  try {
    const user = await TemporaryUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Move user to RejectedUsers collection
    const rejectedUser = new RejectedUser({ ...user.toObject(), remark });
    console.log(rejectedUser);
    await rejectedUser.save();

    // Delete from TemporaryUser
    await TemporaryUser.findByIdAndDelete(id);

    res.status(200).json({ message: "User rejected successfully with remark." });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting user.", error });
  }
};

const getUserCounts = async (req, res) => {
    try {
      const adminCount = await AdminModel.countDocuments();
      const dataEntryCount = await DataEntryModel.countDocuments();
      const viewerCount = await ViewerModel.countDocuments();
  
      res.json({
        data: {
          adminCount,
          dataEntryCount,
          viewerCount
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user counts' });
    }
  };
const temporaryuserscount = async (req, res) => {
    try {
        const count = await TemporaryUser.countDocuments();
        res.json({ count });
      } catch (error) {
        res.status(500).json({ message: "Error fetching new users count" });
      }
};
module.exports = {
    registerUser,
    loginUser,
    getTemporaryUsers,
    approveUser,
    rejectUser,
    getUserCounts,
    temporaryuserscount
};
