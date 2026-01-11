const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => res.send('Hello'));

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    setInterval(() => {
        console.log('Keep alive tick');
    }, 1000);
});
