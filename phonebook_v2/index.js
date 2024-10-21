const express = require("express");
require("dotenv").config();
const cors = require("cors");
const Person = require("./models/person");
const app = express();
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());

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
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => {
      console.log(error);
      response.status(404).end();
    });
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (body === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  Person.findOne({ name: body.name })
    .then((result) => {
      if (result) {
        return response.status(409).json({ error: "person already exists" });
      }
    })
    .catch((error) => next(error));

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  if (!body.number) {
    return response.status(400).json({ error: "number missing" });
  }

  const updatedPerson = {
    number: body.number,
  };

  // Update person by id
  Person.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).json({ error: "person not found" });
      }
    })
    .catch((error) => next(error));
});

// error hanndler function and app.use
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
