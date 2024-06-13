const { MongoClient, ObjectId } = require('mongodb'); // Импортируем MongoClient и ObjectId из библиотеки mongodb
const nodemailer = require('nodemailer'); // Импортируем библиотеку nodemailer для отправки электронной почты
const express = require('express'); // Импортируем express для создания веб-сервера
const cors = require('cors'); // Импортируем cors для разрешения запросов с других доменов
const fs = require('fs').promises; // Импортируем библиотеку fs для работы с файловой системой, используя промисы
const path = require('path'); // Импортируем библиотеку path для работы с путями файловой системы
const process = require('process'); // Импортируем библиотеку process для работы с процессами и переменными окружения
const {authenticate} = require('@google-cloud/local-auth'); //Для гугла
const {SpacesServiceClient} = require('@google-apps/meet').v2;
const { auth } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/meetings.space.created'];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return auth.fromJSON(credentials);
  } catch (err) {
    console.log(err);
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

const client = new MongoClient(process.env.DB_URL); // Создание экземпляра MongoClient с URL базы данных из переменных окружения
const app = express(); // Создание экземпляра express-приложения
const port = 3001; // Определение порта, на котором будет работать сервер

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

app.get('/users', async (req, res) => { // Получение всех пользователей из коллекции 'users'
    try{
        await client.connect();
        const users = await client.db().collection('users').find({}).toArray();
        res.send(users);
    }catch(e){
        console.log(e);
        res.send(e);
    }
})

app.get('/conf', async (req, res) => {
    const createSpace = async (authClient) => {
        const meetClient = new SpacesServiceClient({
            authClient: authClient
        }); // Создание клиента Google Meet с авторизацией
        const request = {
        };
    
        const response = await meetClient.createSpace(request);
        res.send(response[0].meetingUri)
    }   
    authorize().then(createSpace).catch(console.error)
})

app.get('/teachers', async (req, res) => {
    try{
        await client.connect();
        const teachers = await client.db().collection('teachers').find({}).toArray(); // Получение всех учителей из коллекции 'teachers'
        res.send(teachers);
    }catch(e){
        console.log(e);
        res.send(e);
    }
})

app.delete('/users/delete', async (req, res) => {
    try{
        await client.connect();
        client.db().collection('users').deleteOne({_id: new ObjectId(req.body.id)}) // Удаление пользователя по его ID
        res.send('success');
    }catch(e){
        console.log(e);
        res.send(e);
    }
})

app.post('/users/post', async (req, res) => {
    try{
        await client.connect();
        client.db().collection('users').insertOne(req.body); // Вставка нового пользователя в коллекцию 'users'
        res.send('success');
    }catch(e){
        console.log(e);
        res.send(e)
    }
})

app.post('/users/edit', async (req, res) => {

    const filter = { _id: new ObjectId(req.body._id)}; // Создание фильтра для поиска пользователя по ID

    delete req.body._id; // Удаление поля _id из тела запроса
    delete req.body.fullName; // Удаление поля fullName из тела запроса

    const updateDoc = {
        $set: {
            ...req.body
        },
    }; // Создание документа для обновления пользователя

    try{
        await client.connect();
        const result = await client.db().collection('users').updateOne(filter, updateDoc); // Обновление пользователя в коллекции 'users'
        console.log(result)
        res.send('success');
    }catch(e){
        console.log(e);
        res.send(e)
    }
})

app.post('/confirm_email', async (req, res) => {

    const randomCode = Math.floor(Math.random() * (1000000 - 99999 + 1) + 99999); // Генерация случайного кода

    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.LOGIN,
                pass: process.env.PASSWORD,
            },
        }); // Создание транспортера для отправки электронной почты

        await transporter.sendMail({
            from: 'Mary music school',
            to: req.body.login,
            subject: 'Message from Mary music school',
            text: 'bibiibibi',
            html: 'Here is your code: ' + randomCode,
        }); // Отправка письма с кодом подтверждения

        res.send(JSON.stringify(randomCode)); // Отправка кода подтверждения в ответе
    }catch (e) {
        console.log(e);
        res.send(e);
    }
})

app.post('/check_is_exist', async (req, res) => {
    console.log(req.body)
    try{
        await client.connect();
        const users = await client.db().collection('users').find({login: req.body.login}).toArray(); // Поиск пользователей по логину
        console.log(users) // Логирование найденных пользователей
        if(users.length > 0){
            if(req.body?.password === users[0].password){
                res.send(users[0]); // Отправка данных пользователя, если пароли совпадают
            }else if(req.body.password){
                res.send({result: false}); // Отправка результата false, если пароли не совпадают
            }else{
                res.send('exist ' + users[0].login); // Отправка сообщения, что пользователь существует
            }
        }else{
            res.send('not'); // Отправка сообщения, что пользователь не найден
        }
    }catch(e){
        console.log(e);
        res.send(e);
    }
})

app.post('/create_account', async (req, res) => {
    try{
        await client.connect();
        await client.db().collection('users').insertOne(req.body) // Создание нового пользователя в коллекции 'users'
        res.send('success');
    }catch(e){
        console.log(e);
        res.send(e);
    }
})

app.post('/change_password', async (req, res) => {
    const filter = {login: req.body.login}; // Создание фильтра для поиска пользователя по логину
    const update = {$set: {password: req.body.password}} // Создание документа для обновления пароля
    try{
        await client.connect();
        const result = await client.db().collection('users').findOneAndUpdate(filter, update); // Обновление пароля пользователя
        res.send('success');
    }catch(e){
        console.log(e);
        res.send(e);
    }
})

app.listen(port, () => {
    console.log('Success connection'); // Логирование успешного запуска сервера
})