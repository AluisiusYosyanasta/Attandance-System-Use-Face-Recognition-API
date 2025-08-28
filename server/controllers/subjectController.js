import Subject from "../models/Subject.js";

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    return res.status(200).json({ success: true, subjects });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get subject server error" });
  }
};

const addSubject = async (req, res) => {
  try {
    const { sub_code, sub_name, description } = req.body;
    const newSub = new Subject({
      sub_code,
      sub_name,
      description,
    });
    await newSub.save();
    return res.status(200).json({ success: true, subject: newSub });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "add subject server error" });
  }
};

const getSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById({ _id: id });
    return res.status(200).json({ success: true, subject });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get subject server error" });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { sub_code, sub_name, description } = req.body;
    const updateSub = await Subject.findByIdAndUpdate(
      { _id: id },
      {
        sub_code,
        sub_name,
        description,
      }
    );
    return res.status(200).json({ success: true, updateSub });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "edit departement server error" });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletesub = await Subject.findById({ _id: id });
    await deletesub.deleteOne();
    return res.status(200).json({ success: true, deletesub });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "edit subject server error" });
  }
};

export { addSubject, getSubjects, getSubject, updateSubject, deleteSubject };
