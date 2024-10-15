const express = require("express");
require("dotenv").config();
const cors = require("cors");
const Person = require("./models/person");
const app = express();
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// Catch the favicon.ico request and send a 204 No Content status:
app.get("/favicon.ico", (req, res) => res.status(204));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
    console.log("persons requested");
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => {
      console.log(error);
      response.status(404).end();
    });
});

app.get("/info", (request, response) => {
  Person.countDocuments({}).then((count) => {
    response.send(
      `<h1>Phonebook has info for ${count} people</h1><h3>${new Date()}</h3>`
    );
  });

  console.log("info route requested");
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      console.log(error);
      response.status(404).end();
    });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (body === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  Person.findOne({ name: body.name }).then((result) => {
    if (result) {
      return response.status(409).json({ error: "person already exists" });
    }
  });

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      console.log(error);
      response.status(400).json({ error: error.message });
    });
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;

  if (!body.number) {
    return response.status(400).json({ error: "number missing" });
  }

  const updatedPerson = {
    number: body.number,
  };

  // Update person by id
  Person.findByIdAndUpdate(request.params.id, updatedPerson, { new: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).json({ error: "person not found" });
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(400).json({ error: error.message });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
