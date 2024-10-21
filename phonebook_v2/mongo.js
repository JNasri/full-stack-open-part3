const mongoose = require("mongoose");

const password = process.argv[2];
const name = process.argv[3];
const num = process.argv[4];

const url = `mongodb+srv://yusof:${password}@cluster0-fullstackopen.gt9wn.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0-fullStackOpen`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const numberSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Number = mongoose.model("Number", numberSchema);

// this statement is not working
if (process.argv.length === 3) {
  Number.find({}).then((result) => {
    console.log("Phonebook:");
    result.forEach((number) => {
      console.log(`${number.name} - ${number.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  const number = new Number({
    name: name,
    number: num,
  });

  number.save().then(() => {
    console.log(`Added ${name} number ${num} to phonebook!`);
    mongoose.connection.close();
  });
} else {
  console.log("Invalid number of arguments");
  mongoose.connection.close();
}
