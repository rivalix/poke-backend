const express = require("express");
const { User } = require("../models/user");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "/tmp");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname
      .replace(" ", "-")
      .toLowerCase()
      .split(".")
      .slice(0, -1)
      .join(".");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid User Id" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/", uploadOptions.single("profileImage"), async (req, res) => {
  try {
    //Verify if id exist
    if (req.body.id) {
      // Validate valid object id
      if (!mongoose.isValidObjectId(req.body.id)) {
        return res.status(404).send({ message: "User not found" });
      }

      // get user info from db
      const userFromDb = await User.findById(req.body.id);

      // get file
      const file = req.file;

      if (userFromDb) {
        let data = {};
        // if exis file
        if (file) {
          if (userFromDb.profileImage.name) {
            fs.unlinkSync(
              `.${process.env.UPLOAD_DIR}${userFromDb.profileImage.name}`
            );
          }

          data = {
            ...req.body,
            profileImage: {
              url:
                process.env.BASE_PATH + process.env.UPLOAD_DIR + file.filename,
              name: file.filename,
            },
          };
        } else {
          if (!req.body.profileImage) {
            data = {
              name: req.body.name,
              birthday: req.body.birthday,
              hobbie: req.body.hobbie,
              doc_identity: req.body.doc_identity,
              profileImage: "",
            };
          }

          if (req.body.profileImage) {
            data = {
              name: req.body.name,
              birthday: req.body.birthday,
              hobbie: req.body.hobbie,
              doc_identity: req.body.doc_identity,
            };
          }
        }

        Object.assign(userFromDb, data);

        const userUpdated = await userFromDb.save();
        if (userUpdated) {
          return res.send(userUpdated);
        }
      }
    } else {
      let fileName = {};
      if (req.file) {
        fileName = {
          url:
            process.env.BASE_PATH + process.env.UPLOAD_DIR + req.file.filename,
          name: req.file.filename,
        };
      }

      const user = new User({
        ...req.body,
        profileImage: fileName,
      });

      const newUser = await user.save();

      if (!newUser) {
        return res.status(400).send({ message: "User cannot be created" });
      }

      return res.send(newUser);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
