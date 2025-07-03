// GET /me
server.get("/me", verifyToken, async (req, res) => {
  const db = await connectDB();
  const user = await db.collection("user").findOne({ _id: new ObjectId(req.user.userId) });
  res.status(200).json({ username: user.username, role: user.role });
});
