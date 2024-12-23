const express = require("express");
const axios = require("axios"); // trigger api call
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.static("public"));

const config = require("./public/config.json");
app.all("/save", function (req, res)  {
  // Handle save request
  console.log("SAVE REQUEST");
  console.log(req.body);
  res.sendStatus(200);
});
app.all("/publish", function (req, res)  {
  // Handle publish request
  console.log("PUBLISH REQUEST");
  console.log(req.body);
  res.sendStatus(200);
});
app.all("/validate", function (req, res) {
  // Handle validate request
  console.log("VALIDATE REQUEST");
  console.log(req.body);
  res.sendStatus(200);
});
app.all("/stop", async function (req, res) {
  console.log("STOPPING JOURNEY");
  console.log(req.body);
  res.send("Done");
});

const getArgument = (key, arg) => {
  let ret = null;
  if (Array.isArray(arg) && arg.length > 0) {
    arg.forEach((item) => {
      if (typeof item === 'object' && Object.hasOwn(item, key)) {
        ret = item[key];
      }
    });
  }
  return ret;
}


app.all("/execute", async function (req, res) {
  // Endpoint to handle the execution of the custom activity

  console.log("RUNNING CUSTOM ACTIVITY HERE");
  console.log("-------REQUEST------");
  
  let channel = "@VCB_poc";
  let contact = "632717898";
  const token = "8091993565:AAE_BFhW4GU3e1702RlwdUTycr_DL1gOhBo";
  const endpoint = "https://api.telegram.org/bot";
  const url = `${endpoint}${token}`;

  console.log('@ Debug: Execute -----------------------------------------------');
  console.log(req.body);

  // console.log(config);
  try {
      try {
        
        let contactKey = req.body.keyValue
        let inArguments = req.body.inArguments

        console.log('@ Debug: inArguments Execute -----------------------------------------------');
        console.log(inArguments);

        // console.log('@ Debug: Body Execute -----------------------------------------------');
        // console.log(req.body);

        let chat_id = getArgument('telegramID', inArguments);
        let emailAddress = getArgument('emailAddress', inArguments);
        let text = getArgument('customMessage', inArguments);
        let photo = getArgument('bannerPhoto', inArguments);
        let customerName = getArgument('customerName', inArguments);
        let activeCode = getArgument('activationCode', inArguments);
        let registerDate = getArgument('registeredDate', inArguments);

        chat_id = chat_id || contact;

        customerName = customerName || "Phùng Thanh Minh";

        registerDate = registerDate || "25/10/2024";

        activeCode = activeCode || "29863";

        let messenger = {};

        let endpoint = `${url}/sendMessage`;

        text = text.replace("[[customer_name]]", customerName).replace("[[registered_date]]", registerDate).replace("[[registered_code]]", activeCode)

        if (photo) {
          endpoint = `${url}/sendPhoto`;
          messenger = {
            chat_id,
            photo,
            caption: text,
            parse_mode: "HTML" 
          };
        } else {
          messenger = {
            chat_id,
            text,
            parse_mode: "HTML"
          };
        }

        console.log('@ Debug: Check messenger will be sent --------------------------------------------');
        console.log(messenger);

        const response = await axios.post(endpoint, messenger);

        res.send(response.data);
        res.status(200).send({ status: "success" });
      } catch (error) {
        console.error("Error calling Telegram API:", error);
        res.status(500).send({
          error: "An error occurred while Sending Message to Telegram. 555",
        });
      }
  } catch (error) {
    console.error("Error executing custom activity:", error);
    res.status(500).send({
      error: "An error occurred while executing the custom activity. 555",
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

