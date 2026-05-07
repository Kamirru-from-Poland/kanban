const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./mock-server/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/login', (req, res) => {
  const { login, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ login, password }).value();
  if (user) {
    res.json({ token: 'mock-token-' + user.id, userId: user.id, login: user.login });
  } else {
    res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });
  }
});

server.post('/register', (req, res) => {
  const { login, password } = req.body;
  const db = router.db;
  const existing = db.get('users').find({ login }).value();
  if (existing) {
    res.status(409).json({ error: 'Login już zajęty' });
    return;
  }
  const newUser = { id: Date.now().toString(), login, password };
  db.get('users').push(newUser).write();
  res.status(201).json({ message: 'Zarejestrowano pomyślnie' });
});

server.use(router);
server.listen(3000, () => {
  console.log('Mock server działa na http://localhost:3000');
});
