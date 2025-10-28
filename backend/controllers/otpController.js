import OTP from "../models/otpModel.js";
import OTPCollected from "../models/otpCollectedModel.js";
import dotenv from "dotenv";
dotenv.config();

export const getOTP = async (req, res) => {
  console.log("getOTP controller");
  const mobileNo = req.params.mobileNo;

  try {
    const otp = await OTP.find({ mobileNumber: mobileNo });
    otp.purpose = purpose;
    await otp.save();
    res.status(200).json({ otp });
  } catch (error) {
    res
      .status(404)
      .json({ "Error from:": "getOTP controller" }, { message: error.message });
  }
};

export const generateOTP = async (req, res) => {
  console.log("generateOTP controller");

  try {
    const { mobileNo, purpose, selectedDeductionSet } = req.body;
    console.log("mobileNo, purpose ", mobileNo, purpose, selectedDeductionSet);

    // Check count of OTPs generated for the mobile number within the last 24 hours
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 1); // Subtrack 1 day from current date
    console.log("startTime", startTime);

    const numberPresent = await OTP.findOne({ mobileNumber: mobileNo });
    // console.log("numberPresent", numberPresent);

    const otpCollectedByNo = await OTPCollected.findOne({
      mobileNumber: mobileNo,
    });
    // console.log("otpCollectedByNo", otpCollectedByNo);

    if (numberPresent) {
      if (numberPresent.totalOTPsTaken < 5) {
        // console.log("less than 5 OTPS");
        // Generate OTP and save it to the database
        const otpValue = Math.floor(1000 + Math.random() * 9000); // Generate a 6-digit OTP
        console.log("otpValue when number is present", otpValue);
        const otpData = {
          otp: otpValue,
          purpose: purpose,
          selectedDeductionSet,
          totalOTPsTaken: numberPresent.totalOTPsTaken + 1,
        };
        console.log("otpData", otpData);

        let updatedOTP = await OTP.findByIdAndUpdate(
          numberPresent._id,
          otpData,
          {
            new: true,
          }
        );

        await updatedOTP.save();
        console.log("updatedOTP", updatedOTP);

        if (otpCollectedByNo) {
          let updatedUserNumber = await OTPCollected.findByIdAndUpdate(
            otpCollectedByNo._id,
            {
              totalOTPsTaken: otpCollectedByNo.totalOTPsTaken + 1,
              purpose,
              selectedDeductionSet,
            },
            {
              new: true,
            }
          );
          await updatedUserNumber.save();
        } else if (!otpCollectedByNo) {
          let userNumber = await OTPCollected.create({
            mobileNumber: mobileNo,
            purpose,
            selectedDeductionSet,
            totalOTPsTaken: 1,
          });
          await userNumber.save();
        }

        res.status(200).json({
          success: true,
          data: updatedOTP,
          message: "generated otp success",
        }); // Return the generated OTP
      } else {
        console.log("More than 5 OTPs exceeded");
        res
          .status(201)
          .json({ message: "Exceeded OTP limit. Try again later." });

        //   throw new Error("Exceeded OTP limit. Try again later."); // Throw error if limit exceeded
      }
    } else if (!numberPresent) {
      console.log("New number");

      const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 6-digit OTP

      const otpData = {
        mobileNumber: mobileNo,
        otp: otpValue,
        purpose,
        selectedDeductionSet,
        totalOTPsTaken: 1,
      };
      console.log("otpData", otpData);

      let otp = await OTP.create(otpData);
      await otp.save();
      //   console.log("object", otp);

      if (otpCollectedByNo) {
        let updatedUserNumber = await OTPCollected.findByIdAndUpdate(
          otpCollectedByNo._id,
          { totalOTPsTaken: otpCollectedByNo.totalOTPsTaken + 1, purpose },
          {
            new: true,
          }
        );
        await updatedUserNumber.save();
      } else if (!otpCollectedByNo) {
        let userNumber = await OTPCollected.create({
          mobileNumber: mobileNo,
          purpose,
          selectedDeductionSet,
          totalOTPsTaken: 1,
        });
        await userNumber.save();
      }

      res
        .status(200)
        .json({ success: true, data: otp, message: "generated otp success" }); // Return the generated OTP
    }
  } catch (error) {
    res
      .status(404)
      .json(
        { "Error from:": "generateOTP controller" },
        { message: error.message }
      );
    // res.status(404).json({ message: error.message });
  }
};

export const getPhoneNumbers = async (req, res) => {
  console.log("getPhoneNumbers controller");

  try {
    const phoneNumbers = await OTPCollected.find();
    console.log(phoneNumbers.length);
    res.status(200).json(phoneNumbers);
  } catch (error) {
    res
      .status(404)
      .json(
        { "Error from:": "getPhoneNumbers controller" },
        { message: error.message }
      );
  }
};

// DELETE Number
export const deleteNumber = async (req, res) => {
  console.log("deleteNumber controller");
  const numberId = req.params.numberId;
  console.log(numberId);

  try {
    // 1. Delete Order
    const deletedNumber = await OTPCollected.findByIdAndDelete(numberId);
    console.log("deletedNumber", deletedNumber);

    return res.status(201).json(deletedNumber);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};
