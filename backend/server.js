const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// =========================
//   1. CANDIDATES
// =========================

// GET ALL
app.get("/candidates", async (req, res) => {
  const snap = await db.collection("candidates").get();
  const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.send(data);
});

// CREATE
app.post("/candidates", async (req, res) => {
  const ref = db.collection("candidates").doc();
  await ref.set(req.body);
  res.send({ id: ref.id, status: "ok" });
});

// UPDATE
app.put("/candidates/:id", async (req, res) => {
  await db.collection("candidates").doc(req.params.id).update(req.body);
  res.send({ status: "updated" });
});

// DELETE
app.delete("/candidates/:id", async (req, res) => {
  await db.collection("candidates").doc(req.params.id).delete();
  res.send({ status: "deleted" });
});

// =========================
//   2. ATTENDANCE
// =========================
app.get("/attendance", async (req, res) => {
  const snap = await db.collection("attendance").get();
  res.send(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.post("/attendance", async (req, res) => {
  const ref = db.collection("attendance").doc();
  await ref.set(req.body);
  res.send({ id: ref.id, status: "ok" });
});

// =========================
//   3. CONTRACTS
// =========================
app.get("/contracts", async (req, res) => {
  const snap = await db.collection("contracts").get();
  res.send(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.post("/contracts", async (req, res) => {
  const ref = db.collection("contracts").doc();
  await ref.set(req.body);
  res.send({ id: ref.id, status: "ok" });
});

// =========================
//   4. INVOICES
// =========================
app.get("/invoices", async (req, res) => {
  const snap = await db.collection("invoices").get();
  res.send(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.post("/invoices", async (req, res) => {
  const ref = db.collection("invoices").doc();
  await ref.set(req.body);
  res.send({ id: ref.id, status: "ok" });
});

// =========================
//   5. BONUS RECORDS
// =========================
app.get("/bonus", async (req, res) => {
  const snap = await db.collection("bonusRecords").get();
  res.send(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.post("/bonus", async (req, res) => {
  const ref = db.collection("bonusRecords").doc();
  await ref.set(req.body);
  res.send({ id: ref.id, status: "ok" });
});

// =========================
//   6. PAYROLL
// =========================
app.get("/payroll", async (req, res) => {
  const snap = await db.collection("payroll").get();
  res.send(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.post("/payroll", async (req, res) => {
  const ref = db.collection("payroll").doc();
  await ref.set(req.body);
  res.send({ id: ref.id, status: "ok" });
});

// =========================
//   7. COMPANY SETTINGS
// =========================
app.get("/company", async (req, res) => {
  const doc = await db.collection("companySettings").doc("info").get();
  res.send(doc.data() || {});
});

app.post("/company", async (req, res) => {
  await db.collection("companySettings").doc("info").set(req.body);
  res.send({ status: "ok" });
});

// =========================
//   SERVER STATUS
// =========================
app.get("/", (req, res) => {
  res.send("Backend is running with FULL API!");
});

const port = 3000;
app.listen(port, () => console.log("Server running on http://localhost:" + port));
