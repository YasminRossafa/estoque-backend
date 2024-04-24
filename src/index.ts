import express, { Request, Response } from 'express';
const app = express();
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'casemind',
});

app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.post('/cadastro', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  db.query<any[]>(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    (err, result) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (result.length == 0) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if (err) {
            return res.status(500).send(err.message);
          }
          db.query(
            'INSERT INTO usuarios (email, password, nome) VALUES (?, ?, ?)',
            [email, hash, name],
            (err, response) => {
              if (err) {
                return res.status(500).send(err.message);
              }
              return res.send({ msg: 'Cadastro realizado!' });
            }
          );
        });
      } else {
        return res.send({ msg: 'Usuário já cadastrado!' });
      }
    }
  );
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query<any[]>(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    (err, result) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (error) {
            return res.status(500).send(error.message);
          }
          if (response) {                    
            return res.send({ msg: 'Usuário logado!' });
          } else {
            return res.send({ msg: 'Senha incorreta!' });
          }
        });
      } else {
        return res.send({ msg: 'Usuário não cadastrado!' });
      }
    }
  );
}); 

app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    return res.json(result);
  });
});

app.post('/produtos', (req, res) => {
  const { nome, descrição, valor, quantidade } = req.body;
  db.query(
    'INSERT INTO produtos (nome, descrição, valor, quantidade) VALUES (?, ?, ?, ?)',
    [nome, descrição, valor, quantidade],
    (err, result) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.send({ msg: 'Produto adicionado com sucesso!' });
    }
  );
});

app.put('/produtos/:nome', (req, res) => {
  const productName = req.params.nome;
  const { descrição, valor, quantidade } = req.body;
  db.query(
    'UPDATE produtos SET descrição = ?, valor = ?, quantidade = ? WHERE nome = ?',
    [descrição, valor, quantidade, productName],
    (err, result) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.send({ msg: 'Produto atualizado com sucesso!' });
    }
  );
});

app.delete('/produtos/:nome', (req, res) => {
  const productName = req.params.nome;
  db.query('DELETE FROM produtos WHERE nome = ?', [productName], (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    return res.send({ msg: 'Produto excluído com sucesso!' });
  });
});

app.listen(5050, () => {
  console.log('Rodando na porta 5050');
});
