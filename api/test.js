export default function handler(req, res) {
  res.status(200).json({ message: "UPSC backend is working!", timestamp: new Date().toISOString() });
}
