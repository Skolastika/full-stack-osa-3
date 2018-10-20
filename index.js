const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :body :status :res[content-length] - :response-time ms'))



const formatPerson = (person) => {
  return  {
    name: person.name,
    number: person.number,
    id: person._id
  }
}


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
  console.log(JSON.stringify(req.body))
})

app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then(people => {
      console.log(people)
      res.json(people.map(Person.format))
    })
    .catch(error => {
      console.log(error)
    })
})

app.get('/api/persons/:id', (req, res) => {
  Person
    .findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(Person.format(person))
      }
      else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformed id' })
    })

})

app.get('/info', (req, res) => {
  Person
    .countDocuments({})
    .then(count => {
      res.send(
        `<p>puhelinluettelossa ${count} henkilön tiedot</p>
        <p>${new Date()}</p>`
      )
    })
})

app.delete('/api/persons/:id', (req, res) => {
  Person
    .findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => {
      res.status(400).send({ error: 'malformed id' })
    })
})


app.post('/api/persons', (req, res) => {
  console.log(JSON.stringify(req.body))
  const body = req.body
  if (body.name === undefined) {
    return res.status(400).json({ error: 'no name specified' })
  }
  if (body.number === undefined) {
    return res.status(400).json({ error: 'no number specified' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  Person
    .findOne({ name: body.name })
    .then(result => {
      if (result) {
        res.status(409).send({ error: 'name already exists' })
      }
      else {
        person
          .save()
          .then(savedPerson => {
            res.json(Person.format(savedPerson))
          })
          .catch(error => {
            console.log(error)
          })
      }
    })
    .catch(error => {
      console.log(error)
    })
})

app.put('/api/persons/:id', (req, res) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person
    .findByIdAndUpdate(req.params.id, person, { new:true })
    .then(updatedPerson => {
      res.json(Person.format(updatedPerson))
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformed id' })
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})