const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const conn_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const db_name = 'livros';

app.use(
    cors({
        origin: "http://localhost:8080",
    })
);
app.use(express.json());

async function getCollection(collectionName) {
    const client = new MongoClient(conn_uri);
    await client.connect();
    const database = client.db(db_name);
    return { collection: database.collection(collectionName), client };
}

// Beggin - routes
app.get("/books/:page", async (req, res) => {
    const page = parseInt(req.params.page);
    const skip = (page - 1) * 10;
    try {
        const { collection, client } = await getCollection('livro');
        const books = await collection.find({}).skip(skip).limit(10).toArray();
        await client.close();
        res.json(books);
    } catch (error) {
        console.error("An error occurred when searching for the book data: ", error);
        res.status(500).json({ message: `An error occurred when searching for book data: ${error}` });
    }
});

app.get("/len", async (req, res) => {
    try {
        const { collection, client } = await getCollection('livro');
        const amount = await collection.countDocuments();
        await client.close();
        res.json({ amount });
    } catch (error) {
        console.error("An error occurred while counting the books: ", error);
        res.status(500).json({ message: `An error occurred while counting the books: ${error}` });
    }
});

// End - routes

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
