import express, { Request, Response } from 'express';
const app = express();
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import multer, { Multer } from 'multer';


const saltRounds = 10;

const upload = multer({ dest: 'uploads/' });

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
  
  app.post('/produtos', upload.single('imagem'), (req, res) => {
    const { nome, descricao, valor, quantidade } = req.body;
    const imagemPath = req.file ? req.file.path : null;
  
    if (!nome || !descricao || !valor || !quantidade || !imagemPath) {
      return res.status(400).send({ error: 'Todos os campos são obrigatórios.' });
    }
  
    const insertQuery = 'INSERT INTO produtos (nome, descricao, valor, quantidade, imagem) VALUES (?, ?, ?, ?, ?)';
    const params = [nome, descricao, valor, quantidade, imagemPath];
  
    db.query(insertQuery, params, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: 'Erro ao adicionar o produto.' });
      }
      return res.send({ msg: 'Produto adicionado com sucesso!' });
    });
  });
  
  app.put('/produtos/:nome', upload.single('imagem'), (req, res) => {
    const productName = decodeURIComponent(req.params.nome);
    const { descricao, valor, quantidade } = req.body;
    const imagemPath = req.file ? req.file.path : null;
  
    if (!descricao && !valor && !quantidade && !imagemPath) {
      return res.status(400).send({ error: 'Nenhum dado foi modificado.' });
    }
  
    let updateFields = [];
    let params = [];
  
    if (descricao) {
      updateFields.push('descricao = ?');
      params.push(descricao);
    }
    if (valor) {
      updateFields.push('valor = ?');
      params.push(valor);
    }
    if (quantidade) {
      updateFields.push('quantidade = ?');
      params.push(quantidade);
    }
    if (imagemPath) {
      updateFields.push('imagem = ?');
      params.push(imagemPath);
    }
  
    params.push(productName);
  
    const updateQuery = `UPDATE produtos SET ${updateFields.join(', ')} WHERE nome = ?`;
  
    db.query(updateQuery, params, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: 'Erro ao atualizar o produto.' });
      }
      return res.send({ msg: 'Produto atualizado com sucesso!' });
    });
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