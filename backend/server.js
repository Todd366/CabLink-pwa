const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => res.json({status: "ok"}));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
