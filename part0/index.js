const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001
const PATH_PREFIX = ''

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let notes = []

const notes_spa = `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="${PATH_PREFIX}/main.css" />
  <script type="text/javascript" src="${PATH_PREFIX}/spa.js"></script>
</head>
<body>
  <div class='container'>
    <h1>Notes -- single page app</h1>
    <div id='notes'>
    </div>
    <form id='notes_form'>
      <input type="text" name="note"><br>
      <input type="submit" value="Save">
    </form>
  </div>
</body>
</html>
`

const getFrontPageHtml = (noteCount) => {
  return(`
<!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <div class='container'>
          <h1>Full stack Notes app</h1>
          <p>number of notes created ${noteCount}</p>
          <a href='${PATH_PREFIX}/notes'>notes</a>
          <img src='kuva.png' width='200' />
        </div>
      </body>
    </html>
`)
} 

const formatNote = (note) => {
  return {
    content: note.content || note.note || '',
    date: note.date || new Date().toISOString()
  }
}

const isValidNote = (note) => {
  return note && (note.content || note.note)
}

const createNote = (note) => {
  notes.push({
    id: Math.max(0, ...notes.map(n => n.id || 0)) + 1,
    ...note
  })
}

const getNotesList = () => {
  return notes.map(note => `<li>${note.content} ${note.date}</li>`).join('')
}

const notes_page = `
<!DOCTYPE html>
  <html>
    <head>
    </head>
    <body>
      <div class='container'>
        <h1>Notes</h1>
        <ul>
          ${getNotesList()}
        </ul>
        <form action='${PATH_PREFIX}/new_note' method='POST'>
          <input type="text" name="note"><br>
          <input type="submit" value="Save">
        </form>
        <a href='${PATH_PREFIX}/'>back</a>
      </div>
    </body>
  </html>
`

const router = express.Router();

router.use(express.static(path.join(__dirname, 'public')))

router.get('/', (req, res) => {
  const page = getFrontPageHtml(notes.length)
  res.send(page)
})

router.get('/reset', (req, res) => {
  notes.splice(0, notes.length)
  res.status(201).send({ message: 'notes reset' })
})

router.get('/notes', (req, res) => {
  res.send(notes_page)
})

router.get('/spa', (req, res) => {
  res.send(notes_spa)
})

router.get('/data.json', (req, res) => {
  res.json(notes)
})

router.post('/new_note_spa', (req, res) => {
  if (!isValidNote(req.body)) {
    return res.send('invalid note').status(400)
  }

  createNote(formatNote(req.body))

  res.status(201).send({ message: 'note created' })
})

router.post('/new_note', (req, res) => {
  if (typeof req.body.note === 'string') {
    createNote(formatNote({
      content: req.body.note,
      date: new Date()
    }))
  }
  
  res.redirect(`${PATH_PREFIX}/notes`)
})

if (process.env.NODE_ENV === 'development') {
  app.use(PATH_PREFIX, router)
} else {
  app.use(PATH_PREFIX, router)
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`))