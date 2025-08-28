import Guru from "../models/Guru.js";

export const generateGuruId = async (role) => {
  const prefix = role === "guru" ? "G" : "A";

  const lastGuru = await Guru.findOne({
    guruId: { $regex: `^${prefix}-` },
  }).sort({ createAt: -1 });

  if (!lastGuru) return `${prefix}-001`;

  const lastId = lastGuru.guruId.split("-")[1];
  const nextId = (parseInt(lastId, 10) + 1).toString().padStart(3, "0");

  return `${prefix}-${nextId}`;
};
