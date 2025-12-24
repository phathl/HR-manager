const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối Firestore
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore();

// API kiểm tra
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// API ví dụ lấy dữ liệu từ Firestore
app.get("/users", async (req, res) => {
  const snapshot = await db.collection("users").get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.send(data);
});

// API ví dụ thêm dữ liệu
app.post("/users", async (req, res) => {
  const docRef = db.collection("users").doc();
  await docRef.set(req.body);
  res.send({ status: "ok" });
});

const port = 3000;
app.listen(port, () => console.log("Server chạy tại http://localhost:" + port));
