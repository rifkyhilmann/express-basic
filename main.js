const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "aplikasi"
});

database.connect((err) => {
    if(err) throw err;
    console.log("database connection");
})

//Untuk Mengambil Data
app.get('/user', (req, res) => {
    database.query("SELECT * FROM userr", (err, rows) => {
        if(err) throw err;
        const rowsWithBase64Images = rows.map(row => {
            const base64Image = Buffer.from(row.images).toString('base64');
            return {
                id: row.id,
                username: row.username,
                password: row.password,
                email: row.email,
                images: base64Image, // Mengirimkan data gambar dalam format base64
                alamat: row.alamat
            };
        });
        res.json({
            success: true,
            message: "getting user Database",
            data: rowsWithBase64Images
        });
    });
} );

app.get('/user/:username', (req, res) => {
    const { username } = req.params;
    const query = `SELECT * FROM userr WHERE username='${username}'`;
    database.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ message: 'Error retrieving user data' });
        } else {
            if (result.length > 0) {
                const base64Image = Buffer.from(result[0].images).toString('base64');
                res.status(200).send({ user: { ...result[0], images: base64Image } });
            } else {
                res.status(404).send({ message: 'User not found' });
                console.log(username)
            }
        }
    });
  });





//Input Data
app.post('/register', (req, res) => {
    const { username, password, alamat } = req.body;

    const query = "INSERT INTO userr (username, password, email) VALUES (?, ?, ?)";
    database.query(query, [username, password, alamat], (err, result) => {
        if (err) {
            console.error('Gagal menambahkan data: ', err);
            res.status(500).json({ success: false, message: 'Gagal menambahkan data' });
        } else {
            console.log('Data berhasil ditambahkan dengan ID:', result.username);
            res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', insertedId: result.insertId });
        }
    });
});


//jalanin Server di gerbang 3001
app.listen(3001, () => {
    console.log("Server is running on port 3001");
})