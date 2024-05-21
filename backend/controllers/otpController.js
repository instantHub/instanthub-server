import OTP from "../models/otpModel.js";
import OTPCollected from "../models/otpCollectedModel.js";
import path from "path";
import fs from "fs";
import fast2sms from "fast-two-sms";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
// import {fast2sms}
import twilio from "twilio";

export const getOTP = async (req, res) => {
  console.log("getOTP controller");
  const mobileNo = req.params.mobileNo;

  try {
    const otp = await OTP.find({ mobileNumber: mobileNo });
    // console.log(otp);
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
    const mobileNo = req.body.mobileNo;
    console.log(req.body);
    // const otp = await OTP.find();
    // console.log(otp);

    // Check count of OTPs generated for the mobile number within the last 24 hours
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 1); // Subtract 1 day from current date
    console.log("startTime", startTime);

    const numberPresent = await OTP.findOne({ mobileNumber: mobileNo });
    // console.log("numberPresent", numberPresent);

    const otpCollectedByNo = await OTPCollected.findOne({
      mobileNumber: mobileNo,
    });
    // console.log("otpCollectedByNo", otpCollectedByNo);

    // const count = await OTP.countDocuments({
    //   mobileNumber: mobileNo,
    //   createdAt: { $gte: startTime },
    // });
    // console.log("count", count);

    if (numberPresent) {
      if (numberPresent.totalOTPsTaken < 5) {
        // console.log("less than 5 OTPS");
        // Generate OTP and save it to the database
        const otpValue = Math.floor(1000 + Math.random() * 9000); // Generate a 6-digit OTP
        console.log("otpValue when number is present", otpValue);
        const otpData = {
          otp: otpValue,
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
        // console.log("updatedOTP", updatedOTP);

        // try {
        //   const accountSid = "ACf9421c8406a8e8f679152bafbf27faf1";
        //   // const authToken = "dc9a01de4c82ac19f69ddfafcb3156b5";

        //   // Test auth token
        //   const authToken = "f73bbf7866944fe21082adfbbc069173";
        //   // const client = require("twilio")(accountSid, authToken);
        //   const client = twilio(accountSid, authToken).default;
        //   console.log("mobile", `+91${mobileNo}`);
        //   client.messages
        //     .create({
        //       body: `Hi Yusuf!, Your OTP is ${otpValue}`,
        //       from: "+12692314087",
        //       to: `+91${mobileNo}`,
        //     })
        //     .then((message) => console.log(message.sid))
        //     .done();
        // } catch (error) {
        //   console.log("Error from twilio", error);
        // }

        // const accountSid = "ACf9421c8406a8e8f679152bafbf27faf1";
        // const authToken = "dc9a01de4c82ac19f69ddfafcb3156b5";

        // // Test auth token
        // // const authToken = "f73bbf7866944fe21082adfbbc069173";

        // const client = twilio(accountSid, authToken);

        // console.log("mobile", `+91${mobileNo}`);
        // client.messages
        //   .create({
        //     body: `Hi Yusuf!, Your OTP is ${otpValue}`,
        //     from: "+12692314087",
        //     to: `+91${mobileNo}`,
        //   })
        //   .then((message) => console.log(message.sid))
        //   .catch((error) => console.log("Error from twilio", error));

        // console.log("dot env", process.env.OTP_Authorization);
        // var options = {
        //   authorization: process.env.OTP_Authorization,
        //   message: `Your OTP is ${otpValue}`,
        //   numbers: [${otpValue}],
        // };
        // console.log("options", options);
        // const smsData = {
        //   //   sender_id: "FSTSMS",
        //   //   message: `Your OTP is ${otpValue}`,
        //   variable_values: `${otpValue}`,
        //   //   language: "english",
        //   route: "otp",
        //   numbers: mobileNo,
        // };
        // axios
        //   .post("https://www.fast2sms.com/dev/bulkV2", smsData, {
        //     headers: {
        //       Authorization: process.env.OTP_Authorization,
        //     },
        //   })
        //   .then((response) => {
        //     console.log("SMS sent successfully", response.data);
        //   })
        //   .catch((error) => {
        //     console.log("Error sending SMS", error);
        //   });

        // fast2sms
        //   .sendMessage(options)

        //   .then((response) => {
        //     console.log(response);
        //     if (response) {
        //       console.log("Something went wrong while sending SMS");
        //     } else {
        //       console.log("SMS sent successfully", options);
        //     }
        //   })
        //   .catch((error) => {
        //     console.log("Error from fast2sms:", error);
        //   });

        //   Adding userNumber and totalOTPsTaken to OTPCollected model
        if (otpCollectedByNo) {
          let updatedUserNumber = await OTPCollected.findByIdAndUpdate(
            otpCollectedByNo._id,
            { totalOTPsTaken: otpCollectedByNo.totalOTPsTaken + 1 },
            {
              new: true,
            }
          );
          await updatedUserNumber.save();
        } else if (!otpCollectedByNo) {
          let userNumber = await OTPCollected.create({
            mobileNumber: mobileNo,
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
      const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 6-digit OTP
      console.log("otpValue", otpValue);
      const otpData = {
        mobileNumber: mobileNo,
        otp: otpValue,
        totalOTPsTaken: 1,
      };
      console.log("otpData", otpData);

      let otp = await OTP.create(otpData);
      await otp.save();
      //   console.log("object", otp);

      //   Adding userNumber and totalOTPsTaken to OTPCollected model
      if (otpCollectedByNo) {
        let updatedUserNumber = await OTPCollected.findByIdAndUpdate(
          otpCollectedByNo._id,
          { totalOTPsTaken: otpCollectedByNo.totalOTPsTaken + 1 },
          {
            new: true,
          }
        );
        await updatedUserNumber.save();
      } else if (!otpCollectedByNo) {
        let userNumber = await OTPCollected.create({
          mobileNumber: mobileNo,
          totalOTPsTaken: 1,
        });
        await userNumber.save();
      }

      res
        .status(200)
        .json({ success: true, data: otp, message: "generated otp success" }); // Return the generated OTP
    }

    // // Check if the count is less than 10
    // if (count < 5) {
    //   console.log("less than 5 OTPS");
    //   // Generate OTP and save it to the database
    //   const otpValue = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    //   console.log("otpValue", otpValue);
    //   const otpData = {
    //     mobileNumber: mobileNo,
    //     otp: otpValue,
    //   };
    //   console.log("otpData", otpData);

    //   let otp = await OTP.create(otpData);
    //   //   let order = await Order.create(orderData);

    //   //   console.log("object", otp);
    //   await otp.save();
    //   //   console.log("object", otp);

    //   res
    //     .status(200)
    //     .json({ success: true, data: otp, message: "generated otp success" }); // Return the generated OTP
    // } else {
    //   console.log("More than 5 OTPs exceeded");
    //   res.status(201).json({ message: "Exceeded OTP limit. Try again later." });

    //   //   throw new Error("Exceeded OTP limit. Try again later."); // Throw error if limit exceeded
    // }
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
