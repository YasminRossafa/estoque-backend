import express from 'express';
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

app.use(express.json());
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
				// sempre dar return ao usar res.send
				return res.send(err);
			}
			if (result.length == 0) {
				bcrypt.hash(password, saltRounds, (err, hash) => {
					db.query(
						'INSERT INTO usuarios (email, password, nome) VALUES (?, ?, ?)',
						[email, hash, name],
						(err, response) => {
							if (err) {
								// sempre dar return ao usar res.send
								return res.send(err);
							}
							// sempre dar return ao usar res.send
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
				// sempre dar return ao usar res.send
				return res.send(err);
			}
			if (result.length > 0) {
				bcrypt.compare(password, result[0].password, (error, response) => {
					if (error) {
						// sempre dar return ao usar res.send
						return res.send(error);
					}
					if (response) {
						// sempre dar return ao usar res.send
						return res.send({ msg: 'Usuário logado!' });
					} else {
						// sempre dar return ao usar res.send
						return res.send({ msg: 'Senha incorreta!' });
					}
				});
			} else {
				// sempre dar return ao usar res.send
				return res.send({ msg: 'Usuário não cadastrado!' });
			}
		}
	);
}); 

app.get("/", (req, res) => {
    res.send("ok")
});

app.listen(5050, () => {
	console.log('Rodando na porta 3001');
});